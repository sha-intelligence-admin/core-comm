# Billing & Pricing Feature

## Overview
CoreComm operates on a hybrid pricing model:
1. **SaaS Subscription**: Monthly platform fee (Starter, Pro, Enterprise).
2. **Usage-Based Billing**: Pay-as-you-go for telephony minutes and AI processing.

## User Stories
- As an admin, I can subscribe to a monthly plan.
- As an admin, I can view my current usage (minutes used vs. included).
- As an admin, I can add a payment method (Stripe).
- As an admin, I receive alerts when approaching usage limits.

## Technical Implementation

### Components
- `components/billing/plan-card.tsx`: Displays subscription options.
- `components/billing/usage-stats.tsx`: Visualizes consumption.
- `components/billing/credit-balance.tsx`: Shows prepaid balance.

### Database Tables
- `billing_subscriptions`: Tracks Stripe subscription status.
- `billing_usage`: Aggregates daily/monthly usage metrics.
- `company`: Stores `stripe_customer_id`.

### Integrations
- **Stripe**: Handles recurring billing and top-ups.
- **Vapi**: Source of truth for minute usage (synced via webhooks).

## Pricing Model
- **Starter**: $49/mo, includes 100 mins.
- **Pro**: $199/mo, includes 500 mins.
- **Enterprise**: Custom pricing.
- **Overage**: $0.12/min (varies by plan).

## References
- [MIGRATION_TO_HYBRID_PRICING.md](../../MIGRATION_TO_HYBRID_PRICING.md)
- [PRICING_IMPLEMENTATION_PLAN.md](../../PRICING_IMPLEMENTATION_PLAN.md)
