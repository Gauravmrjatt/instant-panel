# Affiliate Panel API Working Description

This document explains the working of each API group in the Affiliate Management Panel.

## 1. Authentication (`/auth`)
*   **Login (`POST /auth/login`):** Validates email and password against the `Users` model. On success, it generates a JWT token and a unique `loginToken` stored in the `Login` model and the user's document. The JWT is returned and also set as a cookie.
*   **Register (`POST /auth/register`):** Creates a new user in the `Users` model. Generates a unique `userId` and `PostbackToken`. Sets a JWT cookie upon success.
*   **Password Reset (`POST /auth/forget`, `POST /auth/reset/:token`):** `forget` sends an email via SMTP with a unique token. `reset` allows updating the password if the token is valid and not expired.

## 2. Tracking & Postback (`/api/v1`)
*   **Click Tracking (`GET /api/v1/click/:camp`):** This is the entry point for users. It expects `aff_click_id` (user identifier) and `sub_aff_id` (referral identifier). It generates a unique `click_id`, saves a record in the `Click` model (including IP and device info), and returns a tracking URL for redirection.
*   **Postback Conversion (`GET /api/v1/postback/:PostbackToken/:event`):** Fired by the advertiser's system when a conversion happens. 
    *   It validates the `PostbackToken` (user's API key) and the `click` ID.
    *   Checks if the campaign is active and if the event exists.
    *   Performs fraud checks: IP blacklisting, banned numbers, conversion delay (click-to-conversion time), duplicate IP/user checks, and caps (daily/total).
    *   If all checks pass, it records a `Lead`.
    *   If `auto` payment is enabled, it triggers the payment processing logic immediately.

## 3. Campaigns (`/add`, `/get`, `/update`, `/delete`)
*   Manage campaign records in the `Campaigns` model. Each campaign has tracking URLs, event configurations (payouts for user and refer), and various restriction settings (IP, same-number, caps).
*   Uses Redis to cache campaign details for faster lookups during click tracking.

## 4. Custom Amounts (`/api/v1/custom`)
*   Allows setting specific payouts (user/refer amount) for individual phone numbers or events. 
*   This overrides the default campaign event payouts during the postback process.
*   Supports both authenticated UI-based management and API-key based upserting.

## 5. Lead Management (`/get/leads`, `/update/leadStatus`)
*   Leads are conversions recorded from postbacks.
*   Status can be `Pending`, `Approved`, or `Rejected`.
*   Updating a lead status to `Approved` can trigger manual payment processing if it wasn't handled automatically.

## 6. Payment Processing (`/pay/user`, `/update/payment`, `/api/update/pendings`)
*   **Direct Payment:** Allows manual payout to a user's number via integrated gateways (Earning Area API or a custom URL).
*   **Manual Lead Payment:** Triggers payment for a specific approved lead.
*   **Referral Payouts:** Aggregates pending referral amounts for a user across multiple leads in a campaign and processes them as a single bulk payment.

## 7. Monitoring & Dashboard (`/get/dashboard`, `/get/reports`)
*   **Dashboard:** Provides real-time stats like today's leads, earnings growth, top-performing campaigns, and recent click/lead charts using MongoDB aggregations.
*   **Reports:** Generates summary reports per campaign, calculating Conversion Rate (CR) and total payouts.

## 8. Settings & Banning
*   **Gateway Settings:** Configures how payouts are sent (API keys, custom endpoints).
*   **Telegram Alerts:** Configures a Telegram Bot to send real-time notifications for leads and payments.
*   **Banning:** Manage a blacklist of phone numbers that are barred from earning payouts across all campaigns for a specific user.
