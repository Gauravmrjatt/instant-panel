# Architecture

## System Overview

```mermaid
graph TB
    subgraph External["External"]
        Affiliate["Affiliate Network"]
        UserClick["User Click"]
    end

    subgraph HTTP["Express API Layer"]
        Tracking["GET /api/v1/click/:camp"]
        GlobalPB["GET /api/v1/postback/:token/:event"]
        CampaignPB["GET /api/v1/campaign/postback/:token/:event"]
    end

    subgraph Cache["Redis Cache"]
        RD_Campaign["campaign:{id} (1h)"]
        RD_User["postbackUser:{token} (1h)"]
        RD_Click["postbackClick:{click} (24h)"]
        RD_Custom["customAmount:{camp}:{event}:{num} (5m)"]
        RD_Dashboard["dashboard:{userId} (5m)"]
        RD_Session["session:{loginToken} (15m)"]
        RD_Gateway["gatewaySetting:{userId} (1h)"]
    end

    subgraph Queues["RabbitMQ Queues"]
        QB_Click["click_buffer"]
        QB_Payment["payment_processing"]
        QB_Lead["lead_write"]
        Q_Dead["dead_letter"]
    end

    subgraph Workers["Background Workers"]
        W_Click["ClickWorker<br/>500 batch / 100ms"]
        W_Payment["PaymentWorker<br/>per-message"]
        W_Lead["LeadWorker<br/>200 batch / 200ms"]
    end

    subgraph DB["MongoDB"]
        M_Campaigns["campaigns"]
        M_Clicks["clicks"]
        M_Leads["leads"]
        M_Payments["payments"]
        M_Users["users"]
        M_Bans["bans"]
        M_Custom["customAmounts"]
        M_Gateway["gatewaySettings"]
    end

    Tracking --> QB_Click
    QB_Click --> W_Click
    W_Click --> M_Clicks

    GlobalPB --> QB_Lead
    GlobalPB --> QB_Payment
    CampaignPB --> QB_Lead
    QB_Payment --> W_Payment
    W_Payment --> M_Payments
    W_Payment --> M_Leads
    QB_Lead --> W_Lead
    W_Lead --> M_Leads

    Tracking -.->|cache| RD_Campaign
    GlobalPB -.->|cache| RD_User
    GlobalPB -.->|cache| RD_Click
    GlobalPB -.->|cache| RD_Custom
    CampaignPB -.->|cache| RD_Click
    CampaignPB -.->|cache| RD_Custom
```

---

## Click Tracking Flow

```mermaid
graph TB
    Start(["GET /api/v1/click/:camp<br/>?aff_click_id=&sub_aff_id="]) --> Validate{aff_click_id<br/>and sub_aff_id<br/>present?}
    Validate -->|No| Error400["400: aff_click_id and<br/>sub_aff_id are required"]
    Validate -->|Yes| CacheCheck["Redis: get campaign:{camp}"]
    CacheCheck -->|Hit| ParseCamp["Parse cached campaign"]
    CacheCheck -->|Miss| DBCamp["MongoDB: Campaign.findOne({_id:camp})<br/>.select('userId tracking')"]
    DBCamp -->|Not found| Error404["404: Campaign not found"]
    DBCamp -->|Found| SetCache["Redis: setEx campaign:{camp} 3600"]
    ParseCamp --> GenClick["Generate UUID click ID<br/>Detect device + IP"]
    SetCache --> GenClick

    GenClick --> MQPub{"sendToQueue<br/>click_buffer"}
    MQPub -->|Success| Return["200: {url with click_id}"]
    MQPub -->|MQ down| Fallback["MongoDB: Click.create (direct)"]
    Fallback --> Return

    subgraph ClickWorker["ClickWorker Process"]
        W_Start["Buffer (max 500)"] --> W_Check{buffer >= 500<br/>or 100ms elapsed?}
        W_Check -->|No| Wait["Wait for more messages"]
        W_Check -->|Yes| W_Flush["MongoDB: Click.insertMany<br/>(ordered: false)"]
        W_Flush --> W_Start
    end

    Return --> End
    Error400 --> End
    Error404 --> End
```

---

## Postback Validation Chain

The validation chain is **identical** for both Global and Campaign postback handlers. The only differences are:
- **How the user is resolved**: Global uses `User.PostbackToken`, Campaign uses `Campaign.postbackToken` → `populate("userId")`
- **Auto-payment branch**: Global uses `Payment.bulkWrite(3) + sendToQueue`, Campaign uses `handelPayment()` directly

```mermaid
graph TB
    Start(["GET /api/v1/postback/:token/:event?click=<br/>or<br/>GET /api/v1/campaign/postback/:token/:event?click="])

    subgraph Resolve["1. Resolve Identity"]
        V_Params{token + click<br/>present?} -->|No| Err_Params["{status:false, msg:...}"]
        V_Params -->|Yes| V_Cache["Redis: get postbackUser:{token}<br/>or postbackCamp:{token}"]

        V_Cache -->|Hit| V_User["Parse cached user"]
        V_Cache -->|Miss| V_DB["MongoDB: find user<br/>via PostbackToken<br/>or Campaign.postbackToken"]
        V_DB -->|Not found| Err_Invalid["Invalid token"]
        V_DB -->|Found| V_SetCache["Redis: setEx 3600"]

        V_User --> V_Clicks
        V_SetCache --> V_Clicks

        subgraph GlobalSpecific["Global-Only"]
            V_Global{"globalPostBack<br/>enabled?"}
            V_Global -->|No| Err_Global["Global Postback not allowed"]
        end

        subgraph CampaignSpecific["Campaign-Only"]
            V_CampMatch{"clickId.campId.postbackToken<br/>=== CampaignToken"}
        end
    end

    subgraph ClickResolve["2. Resolve Click"]
        V_Clicks["Redis: get postbackClick:{click}"]
        V_Clicks -->|Hit| V_ClickFound["Parse cached click"]
        V_Clicks -->|Miss| V_ClickDB["MongoDB: Click.findOne<br/>.populate('campId')"]
        V_ClickDB -->|Not found| Err_Click["Invalid Click ID"]
        V_ClickDB -->|Found| V_ClickCache["Redis: setEx 86400"]
        V_ClickFound --> V_CampStatus
        V_ClickCache --> V_CampStatus

        V_CampStatus{"campStatus<br/>=== false?"} -->|Yes| Err_Paused["Campaign has Paused"]
        V_CampStatus -->|No| V_DupeLead
    end

    subgraph EventResolve["3. Resolve Event"]
        V_DupeLead{"Lead exists for<br/>clickId + event?"} -->|Yes| Err_Dupe["Click id has<br/>already Registered"]
        V_DupeLead -->|No| V_Event["Find event in<br/>campaign.events[]"]
        V_Event -->|Not found| Err_Event["Invalid Event"]
        V_Event -->|Found| V_Custom
    end

    subgraph CustomAmounts["4. Custom Amount Overrides"]
        V_Custom["Redis: get customAmount:{camp}:{event}:{num}"]
        V_Custom -->|Hit| V_CustomParse["Parse cached"]
        V_Custom -->|Miss| V_CustomDB["MongoDB: CustomAmount.findOne"]
        V_CustomDB -->|Found| V_CustomCache["Redis: setEx 300"]
        V_CustomParse --> V_Override["Override eventData.refer/user<br/>amounts & comments<br/>if custom found"]
        V_CustomCache --> V_Override
        V_CustomDB -->|Not found| V_Calc["Calculate clicktoconv<br/>(current - click.createdAt / 1000)"]
        V_Override --> V_Calc
    end
```

---

## Validation Gates (Sequential)

Each gate either passes or rejects with a lead recorded via `rejectLead()` → RabbitMQ `lead_write` queue.

```mermaid
graph TB
    Start(["After click + event resolved"]) --> V_Manual{"type=manual<br/>in query?"}
    V_Manual -->|No| V_IP{campaign.ips<br/>configured AND<br/>IP not in list?}
    V_IP -->|Yes -> Block| Rej_IP["REJECTED: IP not allowed<br/>paymentStatus: REJECTED"]
    V_IP -->|No| V_Delay{indexOfEvent = 0<br/>AND delay set<br/>AND clicktoconv <= delay?}

    V_Delay -->|Yes -> Fraud| Rej_Fraud["REJECTED: Fraud delay<br/>paymentStatus: REJECTED<br/>+ Telegram Notification"]
    V_Delay -->|No| V_Ban["Promise.all:<br/>Ban.findOne(user)<br/>Ban.findOne(refer)"]

    V_Ban -->|User banned| Rej_UserBan["REJECTED: User banned<br/>paymentStatus: REJECTED<br/>referPaymentStatus: REJECTED"]
    V_Ban -->|Refer banned| Rej_ReferBan["REJECTED: Refer banned<br/>paymentStatus: REJECTED<br/>referPaymentStatus: REJECTED"]
    V_Ban -->|Neither| V_Same{"!campaign.same<br/>AND user === refer?"}

    V_Same -->|Yes| Rej_Same["REJECTED: Same user/refer<br/>paymentStatus: REJECTED<br/>referPaymentStatus: REJECTED"]
    V_Same -->|No| V_DupIP{"campaign.ip<br/>AND Lead exists with<br/>same campId + ip + event?"}

    V_DupIP -->|Yes| Rej_DupIP["REJECTED: Duplicate IP<br/>paymentStatus: REJECTED<br/>referPaymentStatus: REJECTED"]
    V_DupIP -->|No| V_DupUser{"campaign.paytm<br/>AND Lead exists with<br/>same campId + user + event?"}

    V_DupUser -->|Yes| Rej_DupUser["Pending: Duplicate user<br/>paymentStatus: PENDING<br/>referPaymentStatus: REJECTED"]
    V_DupUser -->|No| V_Caps{"event.caps set AND<br/>caps <= Approved count?"}

    V_Caps -->|Yes -> Soft Reject| Rej_Caps["Pending: Caps reached<br/>paymentStatus: PENDING<br/>referPaymentStatus: PENDING<br/>→ {status:true}"]
    V_Caps -->|No| V_Daily{"event.dailyCaps set<br/>AND today approved<br/>>= dailyCaps?"}

    V_Daily -->|Yes -> Soft Reject| Rej_Daily["Pending: Daily caps<br/>paymentStatus: PENDING<br/>referPaymentStatus: PENDING<br/>→ {status:true}"]
    V_Daily -->|No| V_Prev{"indexOfEvent > 0?"}

    V_Prev -->|No| V_PayMode
    V_Prev -->|Yes| V_PrevLookup["Lead.findOne for previous event<br/>(same user + click)"]

    V_PrevLookup --> V_PrevEnable{"prevEvent === true?"}
    V_PrevEnable -->|No| V_PayMode
    V_PrevEnable -->|Yes| V_PrevExists{"Previous event<br/>not found?"}

    V_PrevExists -->|Yes| Rej_PrevNotFound["REJECTED: No prev event<br/>paymentStatus: REJECTED<br/>referPaymentStatus: REJECTED"]
    V_PrevExists -->|No| V_PrevTime{"event.time > 0 AND<br/>time diff < min wait?"}

    V_PrevTime -->|Yes| Rej_PrevTime["Pending: Time too short<br/>paymentStatus: PENDING<br/>referPaymentStatus: PENDING"]
    V_PrevTime -->|No| V_PayMode["→ Auto-Payment Decision"]

    style Rej_IP fill:#f88
    style Rej_Fraud fill:#f88
    style Rej_UserBan fill:#f88
    style Rej_ReferBan fill:#f88
    style Rej_Same fill:#f88
    style Rej_DupIP fill:#f88
    style Rej_DupUser fill:#ff8
    style Rej_Caps fill:#ff8
    style Rej_Daily fill:#ff8
    style Rej_PrevNotFound fill:#f88
    style Rej_PrevTime fill:#ff8
```

---

## Auto-Payment Decision

```mermaid
graph TB
    Start(["After all gates pass"]) --> PayMode{"eventData.payMode<br/>=== 'auto'?"}

    PayMode -->|No - Manual| Manual["rejectLead() with status:Pending<br/>→ lead_write queue<br/>→ {status:true}"]

    PayMode -->|Yes| GlobalOrCampaign{"Which handler?"}

    GlobalOrCampaign -->|Global Postback| GlobalPay

    subgraph GlobalPay["Global: BulkWrite + Queue"]
        GBW["Payment.bulkWrite (ordered:false)<br/>1. PendingPayment (user)<br/>2. PendingPayment (refer)<br/>3. Lead (Approved)"]
        GBW --> GQueue["sendToQueue('payment_processing')"]
        GQueue --> GInv["Redis: del dashboard:{userId}"]
        GInv --> GResp["{status:true, msg: success}"]
    end

    GlobalOrCampaign -->|Campaign Postback| CampaignPay["handelPayment()<br/>(sync)"]

    subgraph CampaignPayDetail["Campaign: handelPayment()"]
        CP_Start["handelPayment(userId, eventData, lead, tg, camp, ...)"]
        CP_Start --> CP_Gateway["Redis: get gatewaySetting:{userId}"]
        CP_Gateway -->|Not configured| CP_NoGw["Continue with<br/>PAYMESSAGE = 'not configured'"]
        CP_Gateway -->|Found| CP_Build["Build gateway payout URLs<br/>with placeholder replacement"]
        CP_Build --> CP_PendingUser{"camp.userPending?"}
        CP_PendingUser -->|Yes| CP_SavePendingUser["savePendingPayment(user)"]
        CP_PendingUser -->|No| CP_PendingRef{"camp.referPending?"}
        CP_SavePendingUser --> CP_PendingRef
        CP_PendingRef -->|Yes| CP_SavePendingRef["savePendingPayment(refer)"]
        CP_PendingRef -->|No| CP_Fetch["axios.get(gatewayUrl) x2<br/>(user + refer payments)"]
        CP_SavePendingRef --> CP_Fetch
        CP_Fetch --> CP_SavePay["savePaymentRecords()<br/>→ Payment.save() x2"]
        CP_SavePay --> CP_Notif["Telegram Notification"]
        CP_Notif --> CP_SaveLead["saveLead() →<br/>direct DB insert"]
        CP_SaveLead --> CP_Resp["{status:true, msg: success}"]
    end

    Manual --> End
    GResp --> End
    CP_Resp --> End
```

---

## Reject Lead Flow

Every rejection (both REJECTED and Pending statuses) routes through `rejectLead()`:

```mermaid
graph TB
    RejectCall(["Any gate calls<br/>service.rejectLead(data)"]) --> MQSend{"sendToQueue<br/>lead_write"}

    MQSend -->|Success| ReturnImmediate["Return immediately<br/>(async write)"]
    MQSend -->|MQ down| FallbackDB["Direct: new Lead(data).save()"]

    subgraph LeadWorker["LeadWorker Process"]
        LW_Start["Buffer (max 200)"]
        LW_Check{"buffer >= 200<br/>or 200ms elapsed?"}
        LW_Start --> LW_Check
        LW_Check -->|No| LW_Wait["Wait for more"]
        LW_Check -->|Yes| LW_Flush["MongoDB: Lead.insertMany<br/>(ordered: false)"]
        LW_Flush --> LW_Start
    end

    ReturnImmediate --> LW_Start
    FallbackDB --> End
    LW_Flush --> End
```

---

## Payment Processing Flow

```mermaid
graph TB
    subgraph Producers["Producers"]
        G_PB["Global Postback Handler<br/>on auto-pay success"]
    end

    Producers -->|sendToQueue| Queue["payment_processing queue"]

    subgraph PaymentWorker["PaymentWorker"]
        PW_Start["consumeMessages(payment_processing)"]
        PW_Start --> PW_Data["Parse task:<br/>{userId, value, totalAmount,<br/>comment, clicks, campId}"]

        PW_Data --> PW_Pay["handelPayment(userId, value,<br/>totalAmount, comment)"]

        PW_Pay --> PW_Status{"Payment<br/>Result"}
        PW_Status --> PW_Update1["PendingPayment.updateMany<br/>(refer items → ACCEPTED)"]
        PW_Status --> PW_Update2["Lead.updateMany<br/>(referPaymentStatus → status)"]
        PW_Update1 --> PW_Done
        PW_Update2 --> PW_Done
    end

    Queue --> PaymentWorker
```

---

## Cache Map

| Key Pattern | TTL | Populated By | Invalidated By |
|---|---|---|---|
| `campaign:{campId}` | 1h | Tracking handler | _(expires)_ |
| `postbackUser:{PostbackToken}` | 1h | Global postback handler | `regenerateToken`, `toggleGlobal` |
| `postbackCamp:{CampaignToken}` | 1h | Campaign postback handler | _(expires)_ |
| `postbackClick:{click}` | 24h | Both postback handlers | _(never — click processed once)_ |
| `customAmount:{camp}:{event}:{num}` | 5m | Both postback handlers | _(expires)_ |
| `dashboard:{userId}` | 5m | Dashboard controller | Postback success, campaign create/delete/update |
| `session:{loginToken}` | 15m | Auth middleware | _(expires)_ |
| `gatewaySetting:{userId}` | 1h | `handelPostBackPayments` | Gateway settings update |
| `campaigns:{userId}` | 5m | Campaigns service | Campaign create/update/delete |
| `campaign:{id}` | 1h | Campaigns service | Campaign update/delete |
| `reports:{userId}:{rangeHash}` | 5m | Reports service | _(expires)_ |

---

## Queue Map

| Queue | Producer | Consumer | Batch | Purpose |
|---|---|---|---|---|
| `click_buffer` | Tracking handler | ClickWorker | 500 docs / 100ms | Buffered click insert |
| `payment_processing` | Global postback handler | PaymentWorker | 1 message | Refer payment processing |
| `lead_write` | Both postback handlers (via `rejectLead`) | LeadWorker | 200 docs / 200ms | Buffered lead insert (rejected + pending) |
| `dead_letter` | _(routed from others on failure)_ | — | — | Failed message overflow |

---

## API Route Map

All routes are registered in `middlewares/routes.js` and map to `modules/<domain>/routes.js`.

### Auth

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| POST | `/auth/login` | `modules/auth/controller.login` | No |
| POST | `/auth/register` | `modules/auth/controller.register` | No |
| POST | `/auth/forget` | `modules/auth/controller.forget` | No |
| GET | `/auth/reset/check/:token` | `modules/auth/controller.checkReset` | No |
| POST | `/auth/reset/:token` | `modules/auth/controller.resetPassword` | No |
| POST | `/logout` | `modules/auth/controller.logout` | Yes |
| POST | `/logout/:id` | `modules/auth/controller.logoutSession` | Yes |

### Campaigns

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| POST | `/add/campaign` | `modules/campaigns/controller.addCampaign` | Yes |
| GET | `/get/campaign` | `modules/campaigns/controller.getCampaign` | Yes |
| GET | `/get/campaign/:id` | `modules/campaigns/controller.getCampaignById` | Yes |
| POST | `/update/campaign` | `modules/campaigns/controller.updateCampaign` | Yes |
| POST | `/delete/campaign` | `modules/campaigns/controller.deleteCampaign` | Yes |
| GET | `/get/search` | `modules/campaigns/controller.searchCampaigns` | Yes |

### Leads

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/leads/:campId` | `modules/leads/controller.getLeads` | Yes |
| GET | `/export/leads/:id` | `modules/leads/controller.exportLeads` | Yes |
| POST | `/update/leadStatus` | `modules/leads/controller.updateLeadStatus` | Yes |
| POST | `/update/selected` | `modules/leads/controller.approveSelected` | Yes |
| POST | `/leads/delete` | `modules/leads/controller.deleteLeads` | Yes |

### Clicks

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/click/:id` | `modules/clicks/controller.getClicks` | Yes |
| GET | `/export/click/:id` | `modules/clicks/controller.exportClicks` | Yes |
| POST | `/get/click/search` | `modules/clicks/controller.searchClicks` | Yes |

### Payments

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/payments` | `modules/payments/controller.getPayments` | Yes |
| POST | `/update/payment` | `modules/payments/controller.updatePayment` | Yes |
| POST | `/pay/user` | `modules/payments/controller.manualPay` | Yes |
| GET | `/get/pendingPayments/:id` | `modules/payments/controller.getPendingPayments` | Yes |
| POST | `/api/update/pendings/:id` | `modules/payments/controller.approvePending` | Yes |
| GET | `/api/update/pendings/:id` | `modules/payments/controller.rejectAllPending` | Yes |

### Users / Profile

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/user` | `modules/users/controller.getUser` | Yes |
| GET | `/get/logins` | `modules/users/controller.getLogins` | Yes |
| GET | `/get/logins/ip` | `modules/users/controller.getMyIp` | Yes |
| POST | `/upload/user-profile` | `modules/users/controller.uploadAvatar` | Yes |

### Bans

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/number` | `modules/ban/controller.getBans` | Yes |
| POST | `/ban/number` | `modules/ban/controller.banNumber` | Yes |
| POST | `/ban/unban` | `modules/ban/controller.unban` | Yes |

### Gateway Settings

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/gateway-settings` | `modules/gateway-settings/controller.getSettings` | Yes |
| POST | `/update/gateway-settings` | `modules/gateway-settings/controller.updateSettings` | Yes |

### Telegram Alerts

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/telegram-alert` | `modules/telegram/controller.getAlert` | Yes |
| POST | `/update/telegram-alert` | `modules/telegram/controller.updateAlert` | Yes |

### Custom Amounts

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| POST | `/api/v1/custom` | `modules/custom-amount/controller.customAmount` | Yes |
| GET | `/get/custom` | `modules/custom-amount/controller.getCustom` | Yes |
| POST | `/detete/custom` | `modules/custom-amount/controller.deleteCustom` | Yes |
| POST | `/api/v1/update/custom/:apikey` | `modules/custom-amount/controller.updateCustomExternal` | No |
| POST | `/api/v1/get/custom/:apikey` | `modules/custom-amount/controller.getCustomExternal` | No |

### Billing

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/billing` | `modules/billing/controller.getBilling` | Yes |

### Dashboard

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/dashboard` | `modules/dashboard/controller.getDashboard` | Yes |
| POST | `/get/dashboard` | `modules/dashboard/controller.postDashboard` | Yes |

### Reports

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/reports` | `modules/reports/controller.getReports` | Yes |
| GET | `/get/new/reports/:id` | `modules/reports/controller.getNewReport` | Yes |

### Postback

| Method | Route | Handler | Auth |
|--------|-------|---------|------|
| GET | `/get/postback` | `modules/postback/controller.getConfig` | Yes |
| POST | `/edit/postback` | `modules/postback/controller.toggleGlobal` | Yes |
| POST | `/update/postback` | `modules/postback/controller.regenerateToken` | Yes |

### Postback Processing (no auth)

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/v1/postback/:PostbackToken/:event` | `modules/postback/controller.handleGlobalPostback` |
| GET | `/api/v1/campaign/postback/:CampaignToken/:event` | `modules/postback/controller.handleCampaignPostback` |

### Tracking (no auth)

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/v1/click/:camp` | `modules/tracking/controller.track` |

### External APIs (no auth)

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/v1/view/camp/:apikey` | `modules/apis/controller.getCamp` |
| GET | `/api/v1/checkRefer/:token/:offerid` | `modules/apis/controller.checkRefer` |
| GET | `/api/v1/user/:token/:offerid` | `modules/apis/controller.userAPI` |
| GET | `/api/v1/checkPending/:token/:offerid` | `modules/apis/controller.checkPending` |
| GET | `/api/v1/releasePending` | `modules/apis/controller.releasePending` |

---

---

## API Migration Map (Legacy → RESTful)

All old legacy routes continue working. The new RESTful routes coexist alongside them.

### Auth

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/auth/login` | POST | `/api/v1/auth/login` | POST | none |
| `/auth/register` | POST | `/api/v1/auth/register` | POST | none |
| `/auth/forget` | POST | `/api/v1/auth/forgot-password` | POST | none |
| `/auth/reset/check/:token` | GET | `/api/v1/auth/reset-token/:token` | GET | none |
| `/auth/reset/:token` | POST | `/api/v1/auth/reset-password/:token` | POST | none |
| `/logout` | ALL | `/api/v1/auth/logout` | POST | ALL→POST |
| `/logout/:id` | ALL | `/api/v1/auth/logout/:sessionId` | POST | ALL→POST |

### Tracking

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/api/v1/click/:camp` | GET | `/api/v1/tracking/:campId` | GET | none |

### Postback

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/api/v1/postback/:PostbackToken/:event` | GET | `/api/v1/postback/:token/:event` | GET | none |
| `/api/v1/campaign/postback/:CampaignToken/:event` | GET | `/api/v1/campaigns/:campaignId/postback/:event` | GET | restructured |
| `/get/postback` | GET | `/api/v1/postback/config` | GET | none |
| `/edit/postback` | POST | `PATCH /api/v1/postback/config` | PATCH | POST→PATCH |
| `/update/postback` | POST | `POST /api/v1/postback/config/regenerate-token` | POST | none |

### Campaigns

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/add/campaign` | POST | `POST /api/v1/campaigns` | POST | none |
| `/get/campaign` | GET | `GET /api/v1/campaigns` | GET | none |
| `/get/campaign/:id` | GET | `GET /api/v1/campaigns/:id` | GET | none |
| `/update/campaign` | POST | `PATCH /api/v1/campaigns/:id` | PATCH | POST→PATCH |
| `/delete/campaign` | POST | `DELETE /api/v1/campaigns/:id` | DELETE | POST→DELETE |

### Leads

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/leads/:campId` | GET | `GET /api/v1/campaigns/:campId/leads` | GET | none |
| `/export/leads/:id` | GET | `GET /api/v1/campaigns/:campId/leads/export` | GET | none |
| `/update/leadStatus` | POST | `PATCH /api/v1/leads/:id/status` | PATCH | POST→PATCH |
| `/update/selected` | POST | `POST /api/v1/leads/:id/approve` | POST | none |
| `/leads/delete` | POST | `POST /api/v1/leads/batch-delete` | POST | none |

### Clicks

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/click/:id` | GET | `GET /api/v1/clicks/:id` | GET | none |
| `/export/click/:id` | GET | `GET /api/v1/clicks/:id/export` | GET | none |
| `/get/click/search` | POST | `POST /api/v1/clicks/search` | POST | none |

### Payments

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/payments` | GET | `GET /api/v1/payments` | GET | none |
| `/update/payment` | POST | `POST /api/v1/leads/:leadId/process-payment` | POST | none |
| `/pay/user` | POST | `POST /api/v1/payments/manual` | POST | none |
| `/get/pendingPayments/:id` | GET | `GET /api/v1/payments/pending?campaignId=:id` | GET | id→query |
| `/api/update/pendings/:id` | POST | `POST /api/v1/payments/pending/:campaignId/approve` | POST | none |
| `/api/update/pendings/:id` | GET | `POST /api/v1/payments/pending/:campaignId/reject-all` | POST | GET→POST |

### Dashboard

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/dashboard` | GET | `GET /api/v1/dashboard` | GET | none |
| `/get/dashboard` | POST | `POST /api/v1/dashboard/range` | POST | none |

### Reports

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/reports` | GET | `GET /api/v1/reports` | GET | none |
| `/get/new/reports/:id` | GET | `GET /api/v1/campaigns/:id/report` | GET | none |

### Bans

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/number` | GET | `GET /api/v1/bans` | GET | none |
| `/ban/number` | POST | `POST /api/v1/bans` | POST | none |
| `/ban/unban` | POST | `DELETE /api/v1/bans/:id` | DELETE | POST→DELETE |

### Gateway Settings

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/gateway-settings` | GET | `GET /api/v1/gateway-settings` | GET | none |
| `/update/gateway-settings` | POST | `PUT /api/v1/gateway-settings` | PUT | POST→PUT |

### Telegram

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/telegram-alert` | GET | `GET /api/v1/users/me/telegram-alert` | GET | none |
| `/update/telegram-alert` | POST | `PUT /api/v1/users/me/telegram-alert` | PUT | POST→PUT |

### Custom Amounts

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `POST /api/v1/custom` | POST | `POST /api/v1/custom-amounts` | POST | none |
| `/get/custom` | GET | `GET /api/v1/custom-amounts` | GET | none |
| `/detete/custom` | POST | `DELETE /api/v1/custom-amounts/:id` | DELETE | POST→DELETE |
| `POST /api/v1/update/custom/:apikey` | POST | `POST /api/v1/external/custom-amount/:apiKey` | POST | none |
| `POST /api/v1/get/custom/:apikey` | POST | `GET /api/v1/external/custom-amount/:apiKey` | GET | POST→GET |

### External APIs

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `GET /api/v1/checkRefer/:token/:offerid` | GET | `GET /api/v1/external/refer-leads/:token/:offerId` | GET | none |
| `GET /api/v1/user/:token/:offerid` | GET | `GET /api/v1/external/user-leads/:token/:offerId` | GET | none |
| `GET /api/v1/checkPending/:token/:offerid` | GET | `GET /api/v1/external/pending-payments/:token/:offerId` | GET | none |
| `POST /api/v1/releasePending/:token/:offerid` | POST | `POST /api/v1/external/release-pending/:token/:offerId` | POST | none |
| `GET /api/v1/view/camp/:apikey` | GET | `GET /api/v1/external/campaign/:apiKey` | GET | none |

### Users / Profile

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/user` | GET | `GET /api/v1/users/me` | GET | none |
| `/get/logins` | GET | `GET /api/v1/users/me/sessions` | GET | none |
| `/get/logins/ip` | GET | `GET /api/v1/utils/my-ip` | GET | none |
| `/upload/user-profile` | POST | `POST /api/v1/users/me/avatar` | POST | none |

### Billing

| Old URL | Old Method | New URL | New Method | Δ |
|---------|-----------|---------|-----------|-----|
| `/get/billing` | GET | `GET /api/v1/billing` | GET | none |

---

## Module Structure

Each domain module lives under `modules/<domain>/` and owns its full stack:

```
modules/
├── apis/             controller.js, routes.js
├── auth/             model.js, service.js, controller.js, routes.js
├── ban/              model.js, service.js, controller.js, routes.js
├── billing/          model.js, service.js, controller.js, routes.js
├── campaigns/        model.js, service.js, controller.js, routes.js
├── clicks/           model.js, service.js, controller.js, routes.js
├── custom-amount/    model.js, service.js, controller.js, routes.js
├── dashboard/        controller.js, routes.js
├── gateway-settings/ model.js, service.js, controller.js, routes.js
├── leads/            model.js, service.js, controller.js, routes.js
├── payments/         model.js, service.js, controller.js, routes.js
├── postback/         service.js, controller.js, routes.js
├── reports/          service.js, controller.js, routes.js
├── telegram/         service.js, controller.js, routes.js
├── tracking/         service.js, controller.js, routes.js
└── users/            model.js, service.js, controller.js, routes.js
```
