# Code Annotation Implementation Plan

This plan tracks the progress of adding JSDoc/TSDoc comments to all functions in `hooks/` and `app/api/`.

## 1. Custom Hooks (`hooks/`)

- [x] `hooks/use-assistants.tsx`
- [x] `hooks/use-audit-logs.tsx`
- [x] `hooks/use-call-logs.tsx`
- [x] `hooks/use-calls.tsx`
- [x] `hooks/use-dashboard-stats.tsx`
- [x] `hooks/use-email-accounts.tsx`
- [x] `hooks/use-integrations.tsx`
- [x] `hooks/use-knowledge-bases.tsx`
- [x] `hooks/use-messaging-channels.tsx`
- [x] `hooks/use-mobile.tsx`
- [x] `hooks/use-phone-numbers.tsx`
- [x] `hooks/use-security-settings.tsx`
- [x] `hooks/use-team-members.tsx`
- [x] `hooks/use-toast.ts`
- [x] `hooks/use-user-profile.tsx`

## 2. API Routes (`app/api/`)

### Admin & Auth
- [x] `app/api/admin/migrate/route.ts`
- [x] `app/api/auth/accept-invite/route.ts`
- [x] `app/api/auth/check-profile/route.ts`
- [x] `app/api/auth/signup/route.ts`
- [x] `app/api/auth/verify-invite/route.ts`

### Billing
- [x] `app/api/billing/create-checkout-session/route.ts`
- [x] `app/api/billing/portal/route.ts`
- [x] `app/api/billing/purchase-addon/route.ts`
- [x] `app/api/billing/subscribe/route.ts`
- [x] `app/api/billing/subscription/[id]/cancel/route.ts`

### Core Features (Calls, Dashboard, etc.)
- [x] `app/api/calls/[id]/route.ts`
- [x] `app/api/calls/route.ts`
- [x] `app/api/csrf/route.ts`
- [x] `app/api/dashboard/activity/route.ts`
- [x] `app/api/dashboard/metrics/route.ts`
- [x] `app/api/email-accounts/[id]/route.ts`
- [x] `app/api/email-accounts/route.ts`
- [x] `app/api/health/route.ts`

### Integrations & Channels
- [x] `app/api/integrations/route.ts`
- [x] `app/api/integrations/[id]/sync/route.ts`
- [x] `app/api/integrations/test/route.ts`
- [x] `app/api/messaging-channels/route.ts`
- [x] `app/api/messaging-channels/[id]/route.ts`
- [x] `app/api/messaging-channels/test/route.ts`

### 5. Onboarding & Organizations
- [x] `app/api/onboarding/route.ts`
- [x] `app/api/organizations/route.ts`
- [x] `app/api/organizations/create/route.ts`
- [x] `app/api/organizations/select/route.ts`
- [ ] `app/api/organizations/[id]/route.ts` (Verify existence)
- [ ] `app/api/organizations/[id]/members/route.ts` (Verify existence)
- [ ] `app/api/organizations/invitations/route.ts` (Verify existence)
- [ ] `app/api/organizations/invitations/[token]/route.ts` (Verify existence)

### 6. Phone Numbers
- [x] `app/api/phone-numbers/route.ts`
- [x] `app/api/phone-numbers/[id]/route.ts`
- [ ] `app/api/phone-numbers/available/route.ts` (Verify existence)
- [ ] `app/api/phone-numbers/buy/route.ts` (Verify existence)
- [ ] `app/api/phone-numbers/release/route.ts` (Verify existence)
- [ ] `app/api/phone-numbers/update/route.ts` (Verify existence)
- [ ] `app/api/phone-numbers/import/route.ts` (Verify existence)

### 7. Security
- [x] `app/api/security/audit-logs/route.ts`
- [x] `app/api/security/compliance-docs/route.ts`
- [x] `app/api/security/settings/route.ts`

### 8. Team & User
- [x] `app/api/team-members/resend/route.ts`
- [x] `app/api/team-members/[id]/route.ts`
- [x] `app/api/team-members/route.ts`
- [x] `app/api/user/preferences/route.ts`
- [x] `app/api/user/profile/route.ts`

### 9. Vapi & Voice Agents
- [x] `app/api/vapi/assistants/[id]/route.ts`
- [x] `app/api/vapi/assistants/route.ts`
- [ ] `app/api/vapi/knowledge-bases/[id]/files/route.ts` (Verify existence)
- [x] `app/api/vapi/knowledge-bases/[id]/route.ts`
- [x] `app/api/vapi/knowledge-bases/route.ts`
- [x] `app/api/vapi/phone-numbers/[id]/route.ts`
- [x] `app/api/vapi/phone-numbers/route.ts`
- [x] `app/api/voice-agents/[id]/route.ts`
- [x] `app/api/voice-agents/route.ts`

### 10. Webhooks
- [x] `app/api/webhooks/flutterwave/route.ts`
- [x] `app/api/webhooks/twilio/sms/route.ts`
- [x] `app/api/webhooks/twilio/voice/route.ts`
- [x] `app/api/webhooks/vapi/route.ts`

### Webhooks
- [ ] `app/api/webhooks/flutterwave/route.ts`
- [ ] `app/api/webhooks/twilio/sms/route.ts`
- [ ] `app/api/webhooks/twilio/voice/route.ts`
- [ ] `app/api/webhooks/vapi/route.ts`
