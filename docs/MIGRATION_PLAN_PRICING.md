# Migration Plan: Hybrid Tiered + Value Model

## Overview
This plan outlines the steps to migrate the current pricing model to the recommended "Hybrid Tiered + Value Model". The new model lowers entry barriers (Starter $79) while increasing margins through tighter limits and paid add-ons.

## Phase 1: Core Pricing Configuration
**Goal:** Update the base subscription tiers and limits.

1.  **Create New Flutterwave Plans**
    *   Create "Starter" ($79/mo) and "Professional" ($299/mo) plans in Flutterwave Dashboard.
    *   *Note:* The "Business" tier ($899) is not explicitly defined in the new model but can be kept as a high-volume option or deprecated.
    *   **Action:** Run a script to create these plans and get their IDs.

2.  **Update `app/constants/pricing.ts`**
    *   Update `starter` price to `79` and limits to `120` voice minutes.
    *   Update `professional` price to `299` and limits to `600` voice minutes.
    *   Ensure `OVERAGE_RATES` are set to `$0.22` (voice) and `$0.35` (or similar) as per strategy.

3.  **Frontend Updates**
    *   Update `app/(dashboard)/dashboard/billing/page.tsx` to reflect the new pricing and features text.

## Phase 2: Add-On Infrastructure
**Goal:** Enable users to purchase "Add-Ons" (e.g., Extra Numbers, Recording) separately from their base plan.

1.  **Database Schema**
    *   Create a new table `billing_addons`:
        ```sql
        create table billing_addons (
          id uuid primary key default uuid_generate_v4(),
          company_id uuid references users(company_id),
          type text not null, -- 'phone_number', 'call_recording', 'analytics'
          quantity int default 1,
          cost_cents int not null,
          status text default 'active',
          created_at timestamptz default now()
        );
        ```

2.  **Billing Logic for Add-Ons**
    *   **Option A (Wallet Deduction):** Deduct add-on costs from the company's wallet balance monthly.
    *   **Option B (Separate Charge):** Tokenize the card and charge separately (complex).
    *   **Recommendation:** Use **Wallet Deduction**. Users must "Top Up" to cover add-ons, or we auto-charge the card if balance is low (requires "Charge Card" feature).
    *   *Implementation:* Create a scheduled function (Cron) that runs monthly to deduct add-on costs from the wallet.

3.  **Usage Tracker Update**
    *   Update `lib/billing/usage-tracker.ts` to calculate limits dynamically:
        ```typescript
        const totalLimit = planLimit + (addonCount * limitPerAddon);
        ```

## Phase 3: Professional Services & Enterprise
**Goal:** Handle high-value manual services.

1.  **"Contact Sales" Workflow**
    *   For "Enterprise" and "Professional Services" (Setup, Training), replace the "Subscribe" button with a "Contact Sales" form or link (e.g., Cal.com booking).

## Phase 4: Migration Strategy
**Goal:** Handle existing customers.

1.  **Legacy Plans**
    *   Existing customers on the old $149/$399 plans should likely be **grandfathered** to avoid disruption.
    *   We can rename the old plans in `pricing.ts` to `legacy_starter`, `legacy_professional` and hide them from the UI.
    *   New signups will only see the new plans.

## Execution Steps

1.  **Approve Plan:** Confirm if "Wallet Deduction" is acceptable for Add-Ons.
2.  **Run Script:** Create new Flutterwave plans.
3.  **Apply Code Changes:** Update `pricing.ts` and `usage-tracker.ts`.
4.  **Deploy:** Push changes to production.

---

### Immediate Next Step
Shall I proceed with **Phase 1** (Creating new plans and updating `pricing.ts`)?
