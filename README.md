# Affiliate Panel (Instant Panel) - Project Documentation

## Project Overview
This is a full-stack affiliate management panel designed for tracking campaigns, managing leads, and processing payments. It leverages a modern JavaScript stack with a custom Next.js and Express integration.

### Core Technologies
- **Frontend:** [Next.js](https://nextjs.org/) (v13.3.0, Pages Router), [Tailwind CSS](https://tailwindcss.com/), [Material UI (MUI)](https://mui.com/), [NextUI](https://nextui.org/)
- **Backend:** [Express.js](https://expressjs.com/) (Custom Server), [Node.js](https://nodejs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **Messaging/Task Queue:** [RabbitMQ](https://www.rabbitmq.com/) (used for asynchronous payment processing)
- **Caching/Storage:** [Redis](https://redis.io/)
- **Monitoring:** [Prometheus](https://prometheus.io/) (via `prom-client` and `prometheus.yml`)
- **DevOps:** [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- **Integrations:** [Telegraf](https://telegraf.js.org/) (Telegram Bot) for alerts

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        User[User Browser]
    end
    
    subgraph "Application Layer"
        Frontend[Next.js Frontend<br/>SSR + React]
        Express[Express.js Server<br/>Custom Backend]
    end
    
    subgraph "Authentication"
        JWT[JWT Middleware<br/>Token Validation]
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB<br/>Primary Database)]
        Redis[(Redis<br/>Cache Layer)]
    end
    
    subgraph "Message Queue"
        RabbitMQ[RabbitMQ<br/>Task Queue]
        Worker[Payment Worker<br/>Background Process]
    end
    
    subgraph "External Services"
        Gateway[Payment Gateway<br/>External API]
        Telegram[Telegram Bot<br/>Notifications]
    end
    
    subgraph "Monitoring"
        Prometheus[Prometheus<br/>Metrics Collection]
    end
    
    User -->|HTTPS| Frontend
    Frontend -->|API Requests| Express
    Express --> JWT
    JWT -->|Authorized| Express
    Express -->|Read/Write| MongoDB
    Express -->|Cache Get/Set| Redis
    Express -->|Enqueue Tasks| RabbitMQ
    RabbitMQ -->|Consume| Worker
    Worker -->|Update Status| MongoDB
    Worker -->|Process Payment| Gateway
    Express -->|Send Alerts| Telegram
    Express -->|Expose Metrics| Prometheus
    
    style User fill:#e1f5ff
    style Frontend fill:#bbdefb
    style Express fill:#90caf9
    style MongoDB fill:#81c784
    style Redis fill:#ffb74d
    style RabbitMQ fill:#ba68c8
    style Worker fill:#9575cd
    style Gateway fill:#ff8a65
    style Telegram fill:#64b5f6
    style Prometheus fill:#4db6ac
```

### Component Interactions

The system is built as a semi-decoupled full-stack application:

1. **Frontend (Next.js/React):** User interface for affiliates and administrators, providing campaign management, lead tracking, and payment requests
2. **Web Server (Express.js):** Custom backend server that serves the Next.js application and handles REST API requests
3. **API Layer:** Provides endpoints for authentication, data retrieval, and business logic
4. **Authentication (JWT):** Secure access control using JSON Web Tokens stored in cookies or headers
5. **Database (MongoDB):** Persistent storage for all application data (Users, Campaigns, Clicks, Leads, Payments)
6. **Cache (Redis):** High-performance caching for session data and frequent lookups
7. **Task Queue (RabbitMQ):** Asynchronous message broker used to offload long-running tasks like payment processing
8. **Payment Worker (Node.js):** Background process that consumes tasks from RabbitMQ to process payments and update database states
9. **Monitoring (Prometheus):** Service for collecting and aggregating performance metrics
10. **External Integrations:** Telegram Bot for real-time notifications and payment gateways for transaction processing

---

## Database Schema

```mermaid
erDiagram
    Users ||--o{ Campaigns : creates
    Users ||--o{ Clicks : owns
    Users ||--o{ Leads : owns
    Users ||--o{ Payments : receives
    Users ||--o{ LoginToken : has
    
    Campaigns ||--o{ Clicks : tracks
    Campaigns ||--o{ Leads : generates
    Campaigns ||--o{ Payments : triggers
    
    Clicks ||--|| Leads : converts_to
    Clicks ||--o{ Payments : initiates
    
    Leads ||--o{ Payments : results_in
    
    Users {
        ObjectId _id PK
        string name
        string userName UK
        string userId UK
        string PostbackToken UK
        string email UK
        array loginToken
        number phone
        string profileImg
        object tgId
        string password
        boolean premium
        string plan
        string userType
        string userStatus
        date premiumExpireDate
        date createdAt
        date updatedAt
    }
    
    Campaigns {
        ObjectId _id PK
        ObjectId userId FK
        string user
        string name
        number offerID
        boolean campStatus
        boolean paytm
        boolean ip
        boolean same
        boolean crDelay
        string delay
        boolean prevEvent
        boolean userPending
        boolean referPending
        string tracking
        object uniqueOfferID UK
        array ips
        array events
        date createdAt
    }
    
    Clicks {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId campId FK
        string click UK
        string user
        string refer
        string number
        string ip
        object device
        object params
        date createdAt
    }
    
    Leads {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId campId FK
        ObjectId clickId FK
        string click
        string user
        number userAmount
        number referAmount
        string refer
        string ip
        string event
        string status
        string paymentStatus
        string payMessage
        string referPaymentStatus
        string referPayMessage
        string message
        object params
        string clicktoconv
        object uniqueClick UK
        date createdAt
    }
    
    Payments {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId campId FK
        ObjectId clickId FK
        string number
        number amount
        string comment
        string type
        mixed response
        string for
        string event
        string payUrl
        date createdAt
    }
    
    LoginToken {
        ObjectId _id PK
        ObjectId userId FK
        string token
        string ip
        object device
        date createdAt
    }
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Express
    participant JWT as JWT Middleware
    participant MongoDB
    participant Redis
    
    User->>Frontend: Enter credentials
    Frontend->>Express: POST /auth/login
    Express->>MongoDB: Find user by email
    MongoDB-->>Express: User data
    
    alt Valid credentials
        Express->>Express: Validate password
        Express->>Express: Generate UUID login token
        Express->>MongoDB: Save LoginToken record
        Express->>MongoDB: Add token to user.loginToken[]
        Express->>Express: Sign JWT with user data
        Express-->>Frontend: JWT token + cookie
        Frontend-->>User: Login successful
    else Invalid credentials
        Express-->>Frontend: Error: Invalid credentials
        Frontend-->>User: Show error
    end
    
    Note over User,Redis: Subsequent Authenticated Requests
    
    User->>Frontend: Access protected page
    Frontend->>Express: GET /dashboard (with JWT)
    Express->>JWT: Validate token
    JWT->>JWT: Verify signature & expiry
    
    alt Token valid
        JWT->>MongoDB: Find user by userId
        JWT->>MongoDB: Verify loginToken exists
        MongoDB-->>JWT: User data
        JWT->>Express: Attach user to request
        Express-->>Frontend: Protected content
        Frontend-->>User: Display dashboard
    else Token invalid
        JWT-->>Frontend: 401 Unauthorized
        Frontend-->>User: Redirect to login
    end
```

---

## Click Tracking & Lead Conversion Flow

```mermaid
sequenceDiagram
    participant Visitor
    participant TrackingAPI as Tracking API<br/>/api/v1/click/:camp
    participant Redis
    participant MongoDB
    participant Campaign
    participant Click
    
    Visitor->>TrackingAPI: GET /api/v1/click/:campId?aff_click_id=X&sub_aff_id=Y
    
    TrackingAPI->>Redis: Check campaign cache
    
    alt Campaign in cache
        Redis-->>TrackingAPI: Campaign data
    else Campaign not cached
        TrackingAPI->>MongoDB: Query Campaign by ID
        MongoDB-->>TrackingAPI: Campaign data
        TrackingAPI->>Redis: Cache campaign (1 hour)
    end
    
    TrackingAPI->>TrackingAPI: Generate unique click ID (UUID)
    TrackingAPI->>TrackingAPI: Detect device & IP
    
    TrackingAPI->>Click: Create Click record
    Click-->>MongoDB: Save click
    
    TrackingAPI->>TrackingAPI: Replace {click_id} in tracking URL
    TrackingAPI-->>Visitor: Return tracking URL
    
    Visitor->>Visitor: Redirect to tracking URL
    
    Note over Visitor,MongoDB: Later: Postback Conversion
    
    Visitor->>TrackingAPI: Postback /api/v1/postback?click_id=X&event=Y
    TrackingAPI->>MongoDB: Find Click by click_id
    TrackingAPI->>MongoDB: Create Lead record
    TrackingAPI->>MongoDB: Update payment status
    TrackingAPI-->>Visitor: Conversion recorded
```

---

## Payment Processing Flow (Live Updates via RabbitMQ)

```mermaid
sequenceDiagram
    participant User
    participant API as Express API
    participant MongoDB
    participant RabbitMQ
    participant Worker as Payment Worker
    participant Gateway as Payment Gateway
    participant Telegram
    
    User->>API: Request payment
    API->>MongoDB: Create Lead with pending status
    MongoDB-->>API: Lead created
    
    API->>RabbitMQ: Enqueue payment task
    Note over RabbitMQ: Task: {leadId, userId, amount, phone}
    
    API-->>User: Payment initiated
    
    RabbitMQ->>Worker: Consume payment task
    Worker->>Worker: Process payment logic
    
    Worker->>Gateway: POST /pay (External API)
    Gateway-->>Worker: Payment response
    
    alt Payment successful
        Worker->>MongoDB: Update Lead.paymentStatus = SUCCESS
        Worker->>MongoDB: Create Payment record
        Worker->>Telegram: Send success notification
        Telegram-->>User: Payment successful alert
    else Payment failed
        Worker->>MongoDB: Update Lead.paymentStatus = FAILED
        Worker->>MongoDB: Update Lead.payMessage = error
        Worker->>Telegram: Send failure notification
        Telegram-->>User: Payment failed alert
    end
    
    Worker->>RabbitMQ: Acknowledge task completion
    
    Note over User,Telegram: User can check status via dashboard
    User->>API: GET /get/payments
    API->>MongoDB: Query Payments
    MongoDB-->>API: Payment list
    API-->>User: Display payment status (live updates)
```

---

## API Request/Response Flow

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Auth as Auth Middleware
    participant Route as Route Handler
    participant Redis
    participant MongoDB
    participant Response
    
    Client->>Express: HTTP Request (GET/POST/PUT/DELETE)
    
    Express->>Express: Parse body & cookies
    Express->>Express: Log metrics (Prometheus)
    
    alt Protected Route
        Express->>Auth: authValid middleware
        Auth->>Auth: Extract JWT from cookie/header
        Auth->>Auth: Verify JWT signature
        
        alt JWT valid
            Auth->>Auth: authValidWithDb middleware
            Auth->>MongoDB: Find user by userId
            Auth->>MongoDB: Verify loginToken
            MongoDB-->>Auth: User data
            Auth->>Express: Attach req.user
        else JWT invalid
            Auth-->>Client: 401 Unauthorized
        end
    end
    
    Express->>Route: Execute route handler
    
    alt Data retrieval
        Route->>Redis: Check cache
        alt Cache hit
            Redis-->>Route: Cached data
        else Cache miss
            Route->>MongoDB: Query database
            MongoDB-->>Route: Data
            Route->>Redis: Update cache
        end
    end
    
    alt Data mutation
        Route->>MongoDB: Insert/Update/Delete
        MongoDB-->>Route: Operation result
        Route->>Redis: Invalidate/update cache
    end
    
    Route->>Response: Format JSON response
    Response-->>Client: HTTP Response (200/400/500)
    
    Express->>Express: Log response time (Prometheus)
```

---

## Real-Time Features & Live Updates

### RabbitMQ Message Queue Architecture

```mermaid
graph LR
    subgraph "Producers"
        API1[Express API<br/>Payment Request]
        API2[Express API<br/>Lead Creation]
        API3[Express API<br/>Postback Handler]
    end
    
    subgraph "RabbitMQ Broker"
        Queue1[Payment Queue<br/>durable]
        Queue2[Notification Queue<br/>durable]
    end
    
    subgraph "Consumers"
        Worker1[Payment Worker 1]
        Worker2[Payment Worker 2]
        Worker3[Notification Worker]
    end
    
    subgraph "External Services"
        Gateway[Payment Gateway]
        TG[Telegram Bot]
    end
    
    API1 -->|Enqueue| Queue1
    API2 -->|Enqueue| Queue1
    API3 -->|Enqueue| Queue2
    
    Queue1 -->|Consume| Worker1
    Queue1 -->|Consume| Worker2
    Queue2 -->|Consume| Worker3
    
    Worker1 -->|Process| Gateway
    Worker2 -->|Process| Gateway
    Worker3 -->|Send| TG
    
    style Queue1 fill:#ba68c8
    style Queue2 fill:#ba68c8
    style Worker1 fill:#9575cd
    style Worker2 fill:#9575cd
    style Worker3 fill:#9575cd
```

### Live Update Mechanisms

1. **RabbitMQ Task Queue:** Asynchronous processing of payments and notifications
2. **Redis Caching:** Real-time data access with automatic cache invalidation
3. **Telegram Notifications:** Instant alerts for payment status changes
4. **Prometheus Metrics:** Live monitoring of system performance and request metrics

---

## Building and Running

### Prerequisites
- Docker and Docker Compose
- Node.js (v18 recommended)

### Development

#### Full Stack (Docker)
```bash
docker-compose up --build
```
This starts the application, MongoDB, Redis, RabbitMQ, and Prometheus.

#### Local Development (No Docker)
1. Ensure MongoDB, Redis, and RabbitMQ are running locally
2. Create a `.env` file based on the environment variables needed:
   ```env
   DB_URL=mongodb://localhost:27017/affiliate-panel
   PORT=3000
   RABBITMQ_URL=amqp://localhost
   METRICS_AUTH_TOKEN=your-secret-token
   ```
3. Run the server with nodemon:
   ```bash
   npm run all
   ```
4. Run Next.js only:
   ```bash
   npm run dev
   ```

### Production
```bash
npm run build
npm run start
```

---

## Directory Structure

```
instant-panel/
├── pages/                    # Next.js frontend pages
│   ├── _app.js              # App wrapper
│   ├── _document.js         # Document wrapper
│   ├── dashboard/           # Protected dashboard pages
│   └── auth/                # Authentication pages
├── server/                   # Custom Express backend
│   ├── index.js             # Entry point
│   ├── models/              # Mongoose schemas
│   │   ├── Users.js
│   │   ├── Campaigns.js
│   │   ├── Clicks.js
│   │   ├── Leads.js
│   │   ├── Payments.js
│   │   └── ...
│   ├── routes/              # Express route handlers
│   │   ├── auth/            # Authentication routes
│   │   ├── api/             # API routes
│   │   │   ├── campaign/
│   │   │   ├── leads/
│   │   │   ├── payments/
│   │   │   ├── tracking/
│   │   │   └── ...
│   │   └── logout.js
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.js          # JWT authentication
│   │   └── routes.js        # Route registration
│   ├── worker/              # Background workers
│   │   └── paymentWorker.js
│   └── lib/                 # Utility functions
│       ├── rabbitMQ.js      # RabbitMQ client
│       ├── redisClient.js   # Redis client
│       ├── logger.js
│       └── ...
├── components/              # Reusable React components
├── public/                  # Static assets
├── styles/                  # Global CSS
├── docker-compose.yaml      # Infrastructure orchestration
├── prometheus.yml           # Monitoring configuration
└── package.json             # Dependencies and scripts
```

---

## Key Files

- [server/index.js](file:///Users/gauravchaudhary/Projects/Node/instant-panel/server/index.js) - Entry point for the custom Express server
- [package.json](file:///Users/gauravchaudhary/Projects/Node/instant-panel/package.json) - Project dependencies and scripts
- [docker-compose.yaml](file:///Users/gauravchaudhary/Projects/Node/instant-panel/docker-compose.yaml) - Infrastructure orchestration
- [prometheus.yml](file:///Users/gauravchaudhary/Projects/Node/instant-panel/prometheus.yml) - Monitoring configuration
- [server/middlewares/routes.js](file:///Users/gauravchaudhary/Projects/Node/instant-panel/server/middlewares/routes.js) - Centralized Express route definitions

---

## Development Conventions

### Routing
Prefer adding new API routes to `server/routes/` and registering them in `server/middlewares/routes.js`.

### Authentication
Use `authValid` and `authValidWithDb` middlewares from `server/middlewares/auth.js` for protected routes.

### Styling
The project uses a mix of Tailwind CSS and specialized UI libraries (MUI, NextUI). Adhere to existing component patterns.

### Async Tasks
For long-running or critical operations (like payments), use the RabbitMQ task queue logic found in `server/lib/rabbitMQ.js` and `server/worker/`.

### Caching
Use Redis for caching frequently accessed data. See `server/lib/redisClient.js` for the Redis client implementation.

---

## Monitoring & Metrics

### Prometheus Metrics
The application exposes Prometheus metrics at `/metrics` endpoint (protected by bearer token).

**Available Metrics:**
- `http_express_req_res_time` - Request-response time histogram
- `http_requests_total` - Total HTTP requests counter
- `http_active_connections` - Active connections gauge
- Default Node.js metrics (memory, CPU, etc.)

**Access Metrics:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/metrics
```

---

## API Documentation

For detailed API documentation with request/response schemas, authentication requirements, and examples, see [swagger.yaml](file:///Users/gauravchaudhary/Projects/Node/instant-panel/swagger.yaml).

---

## License

This project is private and proprietary.
