# Database Schema

The project uses MongoDB with Mongoose for data modeling. Below are the schema definitions for all major collections.

## 1. Users
Stores affiliate and admin user information.
- `name`: String (Default from myDetails.json)
- `userName`: String (Unique, Required)
- `userId`: String (Unique, Required)
- `PostbackToken`: String (Unique, Required)
- `email`: String (Unique, Required)
- `loginToken`: Array of tokens
- `phone`: Number (10 digits)
- `profileImg`: String (Default: "/assets/img/avatars/1.jpg")
- `tgId`: Object (Telegram integration: chatId, contact, username, label)
- `password`: String (Required)
- `premium`: Boolean (Default: false)
- `plan`: String
- `userType`: String (Default: "affilate")
- `userStatus`: String (Default: "active")
- `premiumExpireDate`: Date
- `createdAt`, `updatedAt`: Date

## 2. Campaigns
Campaign details and event configurations.
- `userId`: ObjectId (Ref: User)
- `user`: String
- `name`: String
- `offerID`: Number
- `campStatus`: Boolean
- `paytm`: Boolean
- `ip`: Boolean
- `same`: Boolean
- `crDelay`: Boolean
- `delay`: String
- `prevEvent`: Boolean
- `userPending`, `referPending`: Boolean
- `tracking`: String
- `uniqueOfferID`: Object (Unique)
- `ips`: Array
- `events`: Array of `EventSchema`
  - `name`: String
  - `user`, `refer`: Number (Payout amounts)
  - `userComment`, `referComment`: String
  - `caps`, `dailyCaps`: Number
  - `eventNumber`: Number (Unique)
  - `time`: Number
  - `payMode`: String (auto/manual)
- `createdAt`: Date

## 3. Leads
Recorded conversions/actions for campaigns.
- `userId`: ObjectId (Ref: User)
- `campId`: ObjectId (Ref: Campaign)
- `clickId`: ObjectId (Ref: Click)
- `click`: String
- `user`: String (Phone number/Identifier)
- `userAmount`, `referAmount`: Number
- `refer`: String
- `ip`: String
- `event`: String
- `status`: String (e.g., Approved, Pending)
- `paymentStatus`: String (UNKNOWN, SUCCESS, FAILURE)
- `payMessage`: String
- `referPaymentStatus`, `referPayMessage`: String
- `uniqueClick`: Object (Unique)
- `createdAt`: Date

## 4. Clicks
Tracking data for every click on a campaign link.
- `userId`: ObjectId (Ref: User)
- `campId`: ObjectId (Ref: Campaign)
- `click`: String (Unique Click ID)
- `user`, `refer`: String
- `number`: String
- `ip`: String
- `device`: Object (Parsed user-agent info)
- `params`: Object (URL parameters)
- `createdAt`: Date

## 5. Payments
History of processed payouts.
- `userId`: ObjectId (Ref: User)
- `campId`: ObjectId (Ref: Campaign)
- `clickId`: ObjectId (Ref: Click)
- `number`: String
- `amount`: Number
- `comment`: String
- `type`: String
- `response`: Mixed (Gateway response)
- `for`: String
- `event`: String
- `payUrl`: String
- `createdAt`: Date

## 6. PendingPayments
Queue for payments waiting to be processed by the worker.
- `userId`, `campId`, `clickId`: ObjectIds
- `user`: String
- `userAmount`: Number
- `type`: String
- `ip`, `event`, `status`: String
- `paymentStatus`, `payMessage`, `message`: String
- `response`: Mixed
- `orderId`: String (Unique)
- `createdAt`: Date

## 7. GatewaySettings
Configuration for external payment APIs.
- `userId`: ObjectId (Ref: User)
- `user`: String (Unique)
- `type`: String (Earning Area / Custom)
- `guid`: String
- `url`: String

## 8. Ban
List of banned users/numbers.
- `userId`: ObjectId (Ref: User)
- `user`: String
- `number`: String
- `banDate`: Date

## 9. LoginTokens
Tracks active sessions and devices.
- `userId`: ObjectId (Ref: User)
- `token`: String (Unique)
- `device`: Object
- `ip`: String
- `createdAt`: Date

## 10. Premium
Subscription and billing details.
- `userId`: ObjectId (Ref: User)
- `number`, `email`, `name`: String
- `amount`: Number
- `discount`: String
- `status`: Boolean
- `payStatus`: String
- `ExpireAt`, `createdAt`: Date

## 11. ResetPassword
Password reset tokens.
- `userId`: ObjectId (Ref: User)
- `token`: String
- `expires`: Date
- `isUsed`: Boolean
- `createdAt`: Date
