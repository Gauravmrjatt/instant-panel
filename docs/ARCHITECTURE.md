# System Architecture

## 1. System Context (C4 Context)

```mermaid
C4Context
    title System Context Diagram for Affiliate Panel

    Person(affiliate, "Affiliate User", "A user managing campaigns, leads, and payouts.")
    Person(admin, "Admin", "System administrator.")

    System(affiliatePanel, "Affiliate Panel", "Allows affiliates to track campaigns, view leads, and request payments.")

    System_Ext(telegram, "Telegram", "Sends alert notifications to users.")
    System_Ext(paymentGateway, "Payment Gateway", "External service (e.g., Earning Area or Custom) for processing payouts.")

    Rel(affiliate, affiliatePanel, "Uses", "HTTPS")
    Rel(admin, affiliatePanel, "Administers", "HTTPS")
    Rel(affiliatePanel, telegram, "Sends alerts to", "HTTPS/API")
    Rel(affiliatePanel, paymentGateway, "Initiates payouts via", "HTTPS/API")
```

## 2. Container Architecture

```mermaid
C4Container
    title Container Diagram for Affiliate Panel

    Person(user, "User", "Affiliate or Admin")

    Container_Boundary(c1, "Affiliate Panel System") {
        Container(web_app, "Next.js Frontend", "React, Tailwind", "Delivers the SPA and static content.")
        Container(api_server, "Express Backend", "Node.js, Express", "Handles API requests, auth, and business logic.")
        Container(worker, "Payment Worker", "Node.js", "Consumes payment tasks from RabbitMQ and processes them.")
        ContainerDb(database, "MongoDB", "NoSQL", "Stores users, campaigns, leads, and payment records.")
        ContainerDb(redis, "Redis", "In-Memory", "Caching and session storage.")
        ContainerQueue(rabbitmq, "RabbitMQ", "Message Broker", "Queues payment processing tasks.")
    }

    Rel(user, web_app, "Visits", "HTTPS")
    Rel(web_app, api_server, "API Calls", "JSON/HTTPS")
    Rel(api_server, database, "Reads/Writes", "Mongoose")
    Rel(api_server, redis, "Reads/Writes", "Redis Client")
    Rel(api_server, rabbitmq, "Publishes Payment Tasks", "AMQP")
    Rel(worker, rabbitmq, "Consumes Tasks", "AMQP")
    Rel(worker, database, "Updates Payment Status", "Mongoose")
```

## 3. Payment Processing Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as Express API
    participant DB as MongoDB
    participant RMQ as RabbitMQ
    participant Worker as Payment Worker
    participant Gateway as External Gateway

    User->>Frontend: Request Payout
    Frontend->>API: POST /api/payments/payToUser
    API->>DB: Validate User & Balance
    alt Validation Fails
        API-->>Frontend: Error (Insufficient Funds/Ban)
    else Validation Success
        API->>DB: Create "Pending" Payment Record
        API->>RMQ: Publish Payment Task
        API-->>Frontend: Success (Request Queued)
    end
    
    RMQ->>Worker: Consume Task
    Worker->>Gateway: Initiate Payout
    Gateway-->>Worker: Response (Success/Fail)
    Worker->>DB: Update Payment & Lead Status
    
    opt Notification Enabled
        Worker->>User: Send Telegram Alert
    end

## 4. Data Model Relationships

```mermaid
erDiagram
    USER ||--o{ CAMPAIGN : owns
    USER ||--o{ CLICK : "tracks for"
    USER ||--o{ LEAD : manages
    USER ||--o{ PAYMENT : "payouts to"
    USER ||--o{ GATEWAY_SETTING : configures
    USER ||--o{ BAN : "blocks numbers"
    
    CAMPAIGN ||--o{ CLICK : "has many"
    CAMPAIGN ||--o{ LEAD : "generates"
    CAMPAIGN ||--o{ PENDING_PAYMENT : "queues for"
    
    CLICK ||--o| LEAD : "converts to"
    CLICK ||--o{ PAYMENT : "linked to"
    
    LEAD ||--o| PAYMENT : "triggers"
    PENDING_PAYMENT ||--o| PAYMENT : "becomes"
```
```
