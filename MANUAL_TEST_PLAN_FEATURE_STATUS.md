# Manual Test Plan – Feature Implementation Status

This file classifies the **features referenced in** [MANUAL_TEST_PLAN.md](MANUAL_TEST_PLAN.md) as:
- **Implemented** (exists in codebase as a page and/or API route)
- **Partially implemented** (present but has TODOs, placeholder behavior, or missing critical pieces)
- **Not implemented** (referenced by the test plan but missing in the repo)

> Scope note: “Implemented” here means **implemented in this repository** (UI/API). It does not guarantee the feature will work without external configuration (Supabase/Vapi/Twilio/Billing provider) and required database tables.

---

## Implemented (in repo)

### Smoke & platform endpoints
- Health endpoint: [app/api/health/route.ts](app/api/health/route.ts)
- CSRF endpoint: [app/api/csrf/route.ts](app/api/csrf/route.ts)

### Authentication & profile
- Auth UI routes exist under [app/auth](app/auth) (login, signup, forgot/reset password, callback, confirm, verify-mfa, setup-mfa)
- Auth APIs (invite + profile bootstrap):
  - [app/api/auth/check-profile/route.ts](app/api/auth/check-profile/route.ts)
  - [app/api/auth/signup/route.ts](app/api/auth/signup/route.ts)
  - [app/api/auth/verify-invite/route.ts](app/api/auth/verify-invite/route.ts)
  - [app/api/auth/accept-invite/route.ts](app/api/auth/accept-invite/route.ts)
- User profile/preferences APIs:
  - [app/api/user/profile/route.ts](app/api/user/profile/route.ts)
  - [app/api/user/preferences/route.ts](app/api/user/preferences/route.ts)

### MFA / 2FA (enrollment + verification pages)
- MFA UI routes exist under [app/auth](app/auth) (setup/verify)
- MFA components are wired into Security UI:
  - [app/(dashboard)/security/page.tsx](app/(dashboard)/security/page.tsx)
  - [components/mfa-enrollment.tsx](components/mfa-enrollment.tsx)

### Onboarding + organization creation/selection
- Onboarding UI page: [app/onboarding/page.tsx](app/onboarding/page.tsx)
- Organization selection UI: [app/organizations/page.tsx](app/organizations/page.tsx)
- Organization creation UI (multi-step onboarding wizard): [app/organizations/create/page.tsx](app/organizations/create/page.tsx)
- Organization APIs:
  - List orgs: [app/api/organizations/route.ts](app/api/organizations/route.ts)
  - Create org: [app/api/organizations/create/route.ts](app/api/organizations/create/route.ts)
  - Select org: [app/api/organizations/select/route.ts](app/api/organizations/select/route.ts)

### Team members
- Team UI page: [app/(dashboard)/team/page.tsx](app/(dashboard)/team/page.tsx)
- Team APIs:
  - [app/api/team-members/route.ts](app/api/team-members/route.ts)
  - [app/api/team-members/[id]/route.ts](app/api/team-members/[id]/route.ts)
  - [app/api/team-members/resend/route.ts](app/api/team-members/resend/route.ts)

### Dashboard metrics + activity
- Dashboard UI: [app/(dashboard)/dashboard/page.tsx](app/(dashboard)/dashboard/page.tsx)
- Metrics + activity APIs:
  - [app/api/dashboard/metrics/route.ts](app/api/dashboard/metrics/route.ts)
  - [app/api/dashboard/activity/route.ts](app/api/dashboard/activity/route.ts)
- Activity feed component (client fetches /api/dashboard/activity): [components/activity-feed.tsx](components/activity-feed.tsx)

### Calls & transcripts (history)
- Call logs UI page: [app/(dashboard)/call-logs/page.tsx](app/(dashboard)/call-logs/page.tsx)
- Calls API:
  - [app/api/calls/route.ts](app/api/calls/route.ts)
  - [app/api/calls/[id]/route.ts](app/api/calls/[id]/route.ts)

### Voice agents / AI agents
- Voice agents UI: [app/(dashboard)/voice-agents/page.tsx](app/(dashboard)/voice-agents/page.tsx)
- AI agents UI: [app/(dashboard)/ai-agents/page.tsx](app/(dashboard)/ai-agents/page.tsx)
- Voice agents API:
  - [app/api/voice-agents/route.ts](app/api/voice-agents/route.ts)
  - [app/api/voice-agents/[id]/route.ts](app/api/voice-agents/[id]/route.ts)
- Vapi assistant management APIs:
  - [app/api/vapi/assistants/route.ts](app/api/vapi/assistants/route.ts)
  - [app/api/vapi/assistants/[id]/route.ts](app/api/vapi/assistants/[id]/route.ts)

### Knowledge base (RAG)
- Knowledge base UI: [app/(dashboard)/knowledge-base/page.tsx](app/(dashboard)/knowledge-base/page.tsx)
- Vapi knowledge base APIs:
  - [app/api/vapi/knowledge-bases/route.ts](app/api/vapi/knowledge-bases/route.ts)
  - [app/api/vapi/knowledge-bases/[id]/route.ts](app/api/vapi/knowledge-bases/[id]/route.ts)
  - File sub-route: [app/api/vapi/knowledge-bases/[id]/files/route.ts](app/api/vapi/knowledge-bases/[id]/files/route.ts)

### Phone numbers (management)
- Phone numbers UI: [app/(dashboard)/phone-numbers/page.tsx](app/(dashboard)/phone-numbers/page.tsx)
- Phone numbers APIs:
  - Local phone numbers: [app/api/phone-numbers/route.ts](app/api/phone-numbers/route.ts), [app/api/phone-numbers/[id]/route.ts](app/api/phone-numbers/[id]/route.ts)
  - Vapi phone numbers: [app/api/vapi/phone-numbers/route.ts](app/api/vapi/phone-numbers/route.ts), [app/api/vapi/phone-numbers/[id]/route.ts](app/api/vapi/phone-numbers/[id]/route.ts)

### Integrations
- Integrations UI: [app/(dashboard)/integrations/page.tsx](app/(dashboard)/integrations/page.tsx)
- Integrations APIs:
  - [app/api/integrations/route.ts](app/api/integrations/route.ts)
  - [app/api/integrations/test/route.ts](app/api/integrations/test/route.ts)
  - Sync: [app/api/integrations/[id]/sync/route.ts](app/api/integrations/[id]/sync/route.ts)

### Security (audit logs + settings)
- Security UI page (includes export + sessions modal): [app/(dashboard)/security/page.tsx](app/(dashboard)/security/page.tsx)
- Security APIs:
  - Settings: [app/api/security/settings/route.ts](app/api/security/settings/route.ts)
  - Audit logs: [app/api/security/audit-logs/route.ts](app/api/security/audit-logs/route.ts)

### Billing (core)
- Billing UI page: [app/(dashboard)/dashboard/billing/page.tsx](app/(dashboard)/dashboard/billing/page.tsx)
- Billing APIs exist:
  - [app/api/billing/create-checkout-session/route.ts](app/api/billing/create-checkout-session/route.ts)
  - [app/api/billing/subscribe/route.ts](app/api/billing/subscribe/route.ts)
  - [app/api/billing/purchase-addon/route.ts](app/api/billing/purchase-addon/route.ts)
  - Cancel subscription: [app/api/billing/subscription/[id]/cancel/route.ts](app/api/billing/subscription/[id]/cancel/route.ts)

### Webhooks (Vapi + billing)
- Vapi webhook: [app/api/webhooks/vapi/route.ts](app/api/webhooks/vapi/route.ts)
- Billing webhook (Flutterwave): [app/api/webhooks/flutterwave/route.ts](app/api/webhooks/flutterwave/route.ts)

### Twilio webhooks
- Voice webhook: [app/api/webhooks/twilio/voice/route.ts](app/api/webhooks/twilio/voice/route.ts)
- SMS webhook: [app/api/webhooks/twilio/sms/route.ts](app/api/webhooks/twilio/sms/route.ts)

### Admin / internal tools (if enabled)
- Admin migrate endpoint exists: [app/api/admin/migrate/route.ts](app/api/admin/migrate/route.ts)

---

## Partially implemented (exists, but with gaps/TODOs)

### Live transcript (real-time)
- The live transcript component exists and is used by the call transcript modal:
  - Component: [components/live-transcript.tsx](components/live-transcript.tsx)
  - Modal: [components/call-transcript-modal.tsx](components/call-transcript-modal.tsx)
- Why partial:
  - Requires a `call_transcript_segments` table + realtime permissions/replication in Supabase.
  - No dashboard page directly advertises “Live transcript”; it appears as an enhancement inside transcript viewing.

### Vapi webhook signature verification
- Implemented (enforced when `VAPI_WEBHOOK_SECRET` is set):
  - [app/api/webhooks/vapi/route.ts](app/api/webhooks/vapi/route.ts)
  - Helper: [lib/vapi/webhook.ts](lib/vapi/webhook.ts)

### Dashboard metrics – MCP actions tracking
- Implemented by counting `audit_logs.action = 'mcp_action'`:
  - [app/api/dashboard/metrics/route.ts](app/api/dashboard/metrics/route.ts)

### Billing portal
- Implemented as an app-local “portal” URL (provider has no hosted portal):
  - [app/api/billing/portal/route.ts](app/api/billing/portal/route.ts)

### Sessions management (multi-session revoke)
- Implemented as current-session sign out + global sign out:
  - [components/sessions-modal.tsx](components/sessions-modal.tsx)

### Security compliance docs download
- Implemented download endpoint + UI wiring:
  - API: [app/api/security/compliance-docs/route.ts](app/api/security/compliance-docs/route.ts)
  - UI: [app/(dashboard)/security/page.tsx](app/(dashboard)/security/page.tsx)

---

## Not implemented (referenced by test plan but missing)

None currently tracked here (Live Transcript remains “Partially implemented”).

---

## How to use this status file
- If you want “test plan completeness” to match the code exactly, remove/mark any tests under “Not implemented”, and mark “Partially implemented” tests as “blocked until configured”.
- If you want, I can also generate a stricter mapping table: **Manual test section → exact page/API → status → blocking dependencies**.
