# Migration Plan: Hybrid Tiered + Value Pricing Model

This document outlines the steps to migrate CoreComm from the current low-cost subscription model to the new **Hybrid Tiered + Value Model**.

## 1. Pricing Configuration Updates

We need to redefine the `APP_PLANS` constant in the backend to reflect the new tiers, prices, and limits.

### New Plan Structure
```typescript
export const PRICING_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 149, // $149/month
    limits: {
      voice_minutes: 600,
      sms_messages: 1500,
      emails: 1000,
      phone_numbers: 1,
    },
    features: ['Email support', '1 Phone Number'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 399, // $399/month
    limits: {
      voice_minutes: 2000,
      sms_messages: 5000,
      emails: 3000,
      phone_numbers: 2,
    },
    features: ['Priority email + chat', 'Basic analytics', '2 Phone Numbers'],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 899, // $899/month
    limits: {
      voice_minutes: 6000,
      sms_messages: 15000,
      emails: 10000,
      phone_numbers: 5,
    },
    features: ['24/7 support', 'Advanced analytics', 'CRM integration', '5 Phone Numbers'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom
    limits: {
      voice_minutes: null, // Custom
      sms_messages: null, // Unlimited
      emails: null,
      phone_numbers: null,
    },
    features: ['Dedicated infrastructure', 'White-label', 'SLA guarantees'],
  }
};

export const OVERAGE_RATES = {
  voice_minute: 0.22, // $0.22/min
  sms_message: 0.015, // $0.015/message
};
```

## 2. Database Schema Changes

We need to track usage *within the current billing period* to determine if a user is using their included allowance or incurring overage charges.

### New Table: `billing_usage_periods`
Tracks the usage for the current billing cycle.

```sql
CREATE TABLE billing_usage_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES billing_subscriptions(id),
  company_id UUID REFERENCES organizations(id),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Usage Counters
  voice_minutes_used NUMERIC DEFAULT 0,
  sms_count_used INTEGER DEFAULT 0,
  email_count_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(subscription_id, period_start)
);
```

*Note: We will continue to use the `wallets` table for overage charges. If a user exceeds their limit, we deduct from the wallet.*

## 3. Backend Logic Updates

### 3.1. Subscription Creation (`app/api/billing/subscribe`)
*   Update the Flutterwave plan creation to use the new prices ($149, $399, $899).
*   When a subscription is created/renewed (webhook `charge.completed`), create a new record in `billing_usage_periods`.

### 3.2. Usage Tracking & Overage Logic
We need to modify the usage recording logic (e.g., in `app/api/webhooks/vapi/route.ts` for calls).

**Logic Flow for a Call:**
1.  **Fetch Context**: Get the company's active subscription and current `billing_usage_periods` record.
2.  **Check Allowance**:
    *   Get `voice_minutes_limit` from the plan definition.
    *   If `voice_minutes_used < voice_minutes_limit`:
        *   Increment `voice_minutes_used`.
        *   **Cost to User**: $0 (Included).
    *   If `voice_minutes_used >= voice_minutes_limit`:
        *   Calculate cost: `duration * OVERAGE_RATES.voice_minute`.
        *   Deduct from `wallets` balance.
        *   **Cost to User**: Overage rate.
3.  **Record Log**: Save to `usage_logs` (mark as 'allowance' or 'overage').

### 3.3. Add-Ons Implementation
*   Create new products/plans in Flutterwave for:
    *   Additional Phone Number ($15/mo)
    *   Call Recording Storage ($29/mo)
    *   Advanced Analytics ($49/mo)
    *   Custom Voice Training ($149/mo)
    *   Priority Support ($99/mo)
    *   White-label Branding ($199/mo)

## 4. Frontend Updates

### 4.1. Pricing Page (`app/(dashboard)/dashboard/billing/page.tsx`)
*   Update `PlanCard` components to reflect new tiers.
*   Highlight "Most Popular" on Professional tier.
*   Add a section for "Add-Ons".

### 4.2. Dashboard Overview
*   Add a **Usage Widget**:
    *   Progress bar for Voice Minutes (e.g., "450 / 600 mins used").
    *   Progress bar for SMS.
    *   Progress bar for Emails.
*   Show "Overage Charges" if limits are exceeded.

## 5. Migration Steps

1.  **Database**: Run SQL to create `billing_usage_periods`.
2.  **Backend**:
    *   Update `constants.ts` with new pricing.
    *   Update `subscribe` route.
    *   Update `webhooks/vapi` (voice) and SMS/Email handlers to support the "Allowance vs Overage" logic.
3.  **Frontend**: Update Billing page UI.
4.  **Testing**:
    *   Test subscribing to "Starter".
    *   Simulate a call under the limit -> Verify no wallet deduction, usage counter increases.
    *   Simulate a call over the limit -> Verify wallet deduction.

## 6. Immediate Action Items

- [ ] Create `supabase/migrations/20251227_add_usage_periods.sql`.
- [ ] Update `app/constants/pricing.ts` (create if missing).
- [ ] Refactor `app/api/billing/subscribe/route.ts`.
- [ ] Update `app/(dashboard)/dashboard/billing/page.tsx`.
