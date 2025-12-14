# CoreComm Pricing & Billing Implementation Roadmap

This document outlines the technical roadmap for implementing the Hybrid Pricing Model (Subscription + Usage-based) for CoreComm.

## 1. Architecture Overview

We will use **Stripe** for payment processing, handling both recurring subscriptions and one-time credit top-ups.
*   **Subscriptions**: Handle the monthly platform fee (Starter, Growth, Scale).
*   **Wallet System**: An internal ledger system to track prepaid credits for usage (calls, etc.).
*   **Usage Tracking**: Real-time deduction of credits based on call duration.

## 2. Phase 1: Foundation & Database Schema

### 2.1 Dependencies
- Install Stripe SDK: `npm install stripe`

### 2.2 Database Schema (Supabase)
We need new tables to manage billing state.

**`billing_subscriptions`**
*   `id` (uuid)
*   `company_id` (uuid, FK)
*   `stripe_subscription_id` (text)
*   `stripe_customer_id` (text)
*   `plan_id` (text) - e.g., 'starter', 'growth'
*   `status` (text) - 'active', 'past_due', 'canceled'
*   `current_period_end` (timestamp)

**`wallets`**
*   `id` (uuid)
*   `company_id` (uuid, FK, unique)
*   `balance` (numeric) - Stored in cents or smallest currency unit (e.g., 1000 = $10.00)
*   `currency` (text) - default 'usd'
*   `updated_at` (timestamp)

**`wallet_transactions`**
*   `id` (uuid)
*   `wallet_id` (uuid, FK)
*   `amount` (numeric) - Positive for top-ups, negative for usage
*   `type` (text) - 'top_up', 'usage', 'monthly_grant', 'bonus'
*   `reference_id` (text) - e.g., Stripe Payment Intent ID or Call ID
*   `description` (text)
*   `created_at` (timestamp)

**`usage_logs`**
*   `id` (uuid)
*   `company_id` (uuid, FK)
*   `resource_type` (text) - 'voice_inbound', 'voice_outbound', 'phone_number_rental'
*   `quantity` (numeric) - e.g., minutes
*   `cost` (numeric)
*   `meta` (jsonb) - Details like call_id, phone_number
*   `created_at` (timestamp)

## 3. Phase 2: Stripe Configuration

### 3.1 Stripe Dashboard Setup
*   Create **Products** for Subscriptions:
    *   Starter ($49/mo)
    *   Growth ($199/mo)
*   Create **Product** for Credit Top-ups (or use dynamic pricing).

### 3.2 Environment Variables
*   `STRIPE_SECRET_KEY`
*   `STRIPE_PUBLISHABLE_KEY`
*   `STRIPE_WEBHOOK_SECRET`
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 4. Phase 3: Backend Implementation

### 4.1 API Routes
*   `POST /api/billing/create-checkout-session`: Creates a Stripe Checkout session for either a subscription or a one-time top-up.
*   `POST /api/billing/portal`: Creates a Stripe Customer Portal session for managing payment methods/subscriptions.
*   `GET /api/billing/status`: Returns current plan, wallet balance, and recent transactions.

### 4.2 Webhook Handler (`app/api/webhooks/stripe/route.ts`)
*   `checkout.session.completed`:
    *   If mode='subscription': Create/Update `billing_subscriptions` record. Grant initial monthly credits if applicable.
    *   If mode='payment': Add funds to `wallets` and record `wallet_transactions`.
*   `invoice.payment_succeeded`: Handle recurring subscription renewals (reset/add monthly credits).
*   `customer.subscription.updated/deleted`: Update local subscription status.

### 4.3 Usage Logic Integration
*   **Modify Vapi Webhook (`app/api/webhooks/vapi/route.ts`)**:
    *   In `end-of-call-report`:
        1.  Calculate cost based on duration and rates.
        2.  Deduct from `wallets`.
        3.  Create `wallet_transactions` record (type: 'usage').
        4.  Create `usage_logs` record.
    *   **Low Balance Check**: Before allowing a call (e.g., in `assistant-request`), check if `wallet.balance > 0`. If not, reject call or use a fallback.

## 5. Phase 4: Frontend Implementation

### 5.1 Components
*   `BillingDashboard`: Main view.
*   `PlanCard`: Display subscription tiers.
*   `CreditBalance`: Show current balance with a "Top Up" button.
*   `UsageChart`: Visual representation of spend.
*   `TransactionHistory`: Table of wallet transactions.

### 5.2 Pages
*   `/dashboard/billing`: The main billing page.
*   `/dashboard/billing/success`: Return URL after Stripe checkout.

## 6. Phase 5: Migration & Enforcement

### 6.1 Migration Script
*   Create wallets for all existing companies with $0 balance (or a welcome bonus).
*   Assign a "Free/Legacy" plan initially.

### 6.2 Enforcement
*   Implement a check in the Vapi `assistant-request` webhook.
*   If `balance <= 0` and `plan != 'enterprise'`, return an error or a specific "Payment Required" voice message.

## 7. Implementation Steps (Immediate)

1.  [ ] Install Stripe SDK.
2.  [ ] Create Supabase Migration for Billing Tables.
3.  [ ] Create Stripe Webhook Handler skeleton.
4.  [ ] Implement "Top Up" flow (easiest to start with).
