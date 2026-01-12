# CoreComm Manual Test Plan (Comprehensive)

> Goal: Provide a rigorous, **manual** test checklist for CoreComm, including **expected results** for every test.
>
> Notes
> - This is written for the current repo state (Next.js App Router + Supabase + Vapi + optional Twilio + Billing provider).
> - Some flows require external systems (Supabase email, Vapi calls/webhooks, payment provider webhooks). Those tests include alternatives (simulated webhooks / API calls) where possible.
> - Where the app has both UI and API surfaces, you can test either (or both). The expected results include both UI behavior and backend responses.

---

## 0) Test Environments & Test Data

### 0.1 Required environments
- **Local dev** (`npm run dev`) or **staging** deployment
- **Supabase project** (staging recommended) with:
  - Auth enabled
  - Required tables migrated (`users`, `company`, `calls`, `integrations`, `vapi_*`, `audit_logs`, billing tables, etc.)
  - RLS policies enabled and verified
- **Vapi** account + API key (`VAPI_API_KEY`) + webhook configured to `/api/webhooks/vapi`
- **Twilio** (optional, if using Twilio-managed numbers / inbound call flow)
- **Billing provider** configured (repo supports billing routes; some docs mention Flutterwave and Stripe-like fields)

### 0.2 Test accounts matrix
Create at least the following Supabase users:
- **U1 Owner/Admin**: full permissions, has a `company_id`.
- **U2 Member**: belongs to company, non-admin role (if supported).
- **U3 External**: belongs to a different company (or no company).
- **U4 New User**: no profile row at first; used to test onboarding/profile creation.

### 0.3 Seed data to prepare
- Organization/Company A with:
  - 1–2 knowledge bases, each with at least 2 files
  - 1–2 voice agents/assistants
  - 1 phone number linked to an assistant (if supported)
  - ≥ 25 call records (to test pagination)
  - ≥ 25 audit log entries (to test export/pagination)
  - ≥ 3 integrations (mcp, webhook, api/helpdesk/crm if supported)
- Organization/Company B (for cross-tenant access tests)

### 0.4 Browsers/devices
Run key flows in at least:
- Chromium (Chrome/Edge)
- Firefox
- Mobile viewport (responsive)

### 0.5 Evidence capture
For each failed test, capture:
- Screenshot/video
- Browser console log
- Network request/response (HAR if possible)
- Server logs (Next.js)

---

## 1) Smoke & Stability (Build/Boot/Basic Navigation)

### SMOKE-001 – App boots and serves pages
- Preconditions: Env vars set; app running.
- Steps:
  1. Visit `/`.
  2. Navigate to login page.
- Expected:
  - Pages render without runtime errors.
  - No unhandled exceptions in browser console.

### SMOKE-002 – Build succeeds
- Preconditions: Node deps installed.
- Steps: Run `npm run build`.
- Expected:
  - Build exits with code 0.
  - No TypeScript compilation errors.

### SMOKE-003 – Health endpoint
- Preconditions: App running.
- Steps:
  1. `GET /api/health`.
- Expected:
  - Returns HTTP 200 (healthy) or 503 (unhealthy) with structured JSON.

### SMOKE-004 – CSRF endpoint sets cookie
- Preconditions: App running.
- Steps:
  1. `GET /api/csrf`.
- Expected:
  - HTTP 200 with `{ token, message }`.
  - Response includes `Set-Cookie` for CSRF.

### SMOKE-005 – Unauthorized API returns 401
- Preconditions: Not logged in (new incognito window).
- Steps:
  1. Call `GET /api/user/profile`.
- Expected:
  - HTTP 401 with `{ error: ... }`.

---

## 2) Authentication (Login/Signup/Password/Invites)

### AUTH-001 – Login (valid credentials)
- Preconditions: Existing Supabase user with password.
- Steps:
  1. Visit `/auth/login`.
  2. Enter correct email + password.
  3. Submit.
- Expected:
  - User is authenticated.
  - Redirect to dashboard (or onboarding if profile incomplete).
  - Session cookie set.

### AUTH-002 – Login (invalid password)
- Preconditions: Existing user.
- Steps:
  1. Attempt login with wrong password.
- Expected:
  - Error message shown.
  - No session established.

### AUTH-003 – Login rate limiting / repeated failures (behavior check)
- Preconditions: None.
- Steps:
  1. Attempt login with wrong password 10+ times.
- Expected:
  - App continues to respond.
  - If rate limiting exists: clear messaging and temporary lockout.
  - If not: at minimum, no crash; errors remain user-friendly.

### AUTH-004 – Logout
- Preconditions: Logged in.
- Steps:
  1. Trigger logout from UI.
  2. Refresh page.
- Expected:
  - User returns to login.
  - Protected pages redirect to auth.

### AUTH-005 – Session persistence (refresh)
- Preconditions: Logged in.
- Steps:
  1. Refresh the browser.
  2. Reopen the app in a new tab.
- Expected:
  - User remains logged in.
  - No flicker to unauth state beyond normal loading.

### AUTH-006 – Forgot password request
- Preconditions: Existing account email.
- Steps:
  1. Visit `/auth/forgot-password`.
  2. Request password reset.
- Expected:
  - UI confirms reset email sent (even if email doesn’t exist, should avoid account enumeration).

### AUTH-007 – Reset password via link
- Preconditions: Valid password reset link from Supabase.
- Steps:
  1. Open reset link -> `/auth/reset-password` flow.
  2. Set a new password.
  3. Login with new password.
- Expected:
  - Password updated.
  - Old password no longer works.

### AUTH-008 – Reset password link invalid/expired
- Preconditions: Expired reset link.
- Steps:
  1. Open invalid link.
- Expected:
  - Clear error message.
  - No password changed.

### AUTH-009 – Auth callback handler (OAuth/email confirm)
- Preconditions: Email confirmation or OAuth configured.
- Steps:
  1. Trigger auth redirect that lands on `/auth/callback`.
- Expected:
  - User session established.
  - Redirects to appropriate page.

### AUTH-010 – Auth-code error page
- Preconditions: Force auth error (bad code).
- Steps:
  1. Visit `/auth/auth-code-error` with error params.
- Expected:
  - Error details shown safely (no secrets).
  - User can navigate back to login.

### AUTH-011 – Profile error handling
- Preconditions: A user exists in auth but has missing/broken profile row.
- Steps:
  1. Login as that user.
- Expected:
  - Redirect to `/auth/profile-error` (or equivalent handling).
  - Clear remediation guidance.

### AUTH-012 – Signup profile creation API (happy path)
- Preconditions: Create Supabase auth user id.
- Steps:
  1. `POST /api/auth/signup` with `userId`, `email`, `fullName`.
- Expected:
  - HTTP 200 envelope with inserted profile.
  - Profile row exists in `users` table.

### AUTH-013 – Signup profile creation API (duplicate)
- Preconditions: Profile already exists.
- Steps:
  1. Call `POST /api/auth/signup` again.
- Expected:
  - HTTP 409 with `{ error: "User profile already exists" }`.

### AUTH-014 – Invite verification (valid token)
- Preconditions: Existing `organization_invitations` token.
- Steps:
  1. `POST /api/auth/verify-invite` with token.
- Expected:
  - HTTP 200 with email/company/role info.

### AUTH-015 – Invite verification (invalid token)
- Preconditions: None.
- Steps:
  1. Verify with random token.
- Expected:
  - HTTP 404 or 400 with clear error.

### AUTH-016 – Accept invite (happy path)
- Preconditions: Valid invite token.
- Steps:
  1. `POST /api/auth/accept-invite` with token, password, fullName.
- Expected:
  - Creates auth user + profile + membership.
  - Response `{ success: true }`.
  - User can login immediately (or gets message to login).

### AUTH-017 – Accept invite (expired)
- Preconditions: Expired invite.
- Steps:
  1. Try accepting.
- Expected:
  - HTTP 400/404 with error.
  - No user/membership created.

---

## 3) MFA / 2FA (Enrollment, Verification, Enforcement)

### MFA-001 – Open MFA setup page
- Preconditions: Logged in.
- Steps:
  1. Visit `/auth/setup-mfa`.
- Expected:
  - Page renders without errors.
  - Explains enrollment steps.

### MFA-002 – Enroll TOTP factor
- Preconditions: Logged in; no verified factors.
- Steps:
  1. From Security page or setup page, click “Setup 2FA”.
  2. Scan QR code in authenticator app.
  3. Enter generated code.
- Expected:
  - Factor is enrolled and verified.
  - UI indicates “2FA is enabled on your account”.

### MFA-003 – Verify MFA at login when required
- Preconditions: Account has MFA factor; MFA enforced or configured to require.
- Steps:
  1. Login.
  2. If prompted, go to `/auth/verify-mfa`.
  3. Enter code.
- Expected:
  - Correct code completes login.
  - Incorrect code shows error and does not login.

### MFA-004 – Toggle 2FA enforcement (org setting)
- Preconditions: Logged in as admin; Security page available.
- Steps:
  1. Go to Security page.
  2. Toggle “Two-Factor Authentication” setting on.
  3. Refresh page.
- Expected:
  - Toast confirms enabled.
  - Setting persists after refresh.

### MFA-005 – Enforcement alert for users without verified factors
- Preconditions: Org 2FA enforced; user has no verified factor.
- Steps:
  1. Login as non-enrolled user.
  2. Visit any dashboard page.
- Expected:
  - User sees enforcement alert.
  - CTA routes to `/auth/setup-mfa`.

### MFA-006 – Enforcement does not block enrolled users
- Preconditions: Org 2FA enforced; user has verified factor.
- Steps:
  1. Login and navigate dashboard.
- Expected:
  - No enforcement alert.
  - Access is uninterrupted.

---

## 4) Onboarding (Company creation and initial provisioning)

### ONB-001 – New user sees onboarding
- Preconditions: New auth user with no `company_id`.
- Steps:
  1. Login as new user.
- Expected:
  - Redirect to onboarding flow.
  - UI explains steps to create/select company.

### ONB-002 – Create company (happy path)
- Preconditions: New user.
- Steps:
  1. Complete onboarding form.
  2. Submit.
- Expected:
  - Company row created.
  - User profile updated with `company_id`.
  - Dashboard accessible.

### ONB-003 – Onboarding API blocks duplicates
- Preconditions: User already has `company_id`.
- Steps:
  1. Attempt onboarding create endpoint again.
- Expected:
  - HTTP error indicating already onboarded.
  - No duplicate company created.

### ONB-004 – Onboarding validation
- Preconditions: None.
- Steps:
  1. Submit onboarding form with missing required fields.
- Expected:
  - Field-level validation.
  - No backend changes.

---

## 5) Organizations (Create/Select/Access Control)

### ORG-001 – List/select organization (if UI supports)
- Preconditions: User belongs to multiple orgs.
- Steps:
  1. Visit org selection page (or org switcher).
  2. Switch org.
- Expected:
  - Active org changes.
  - Data displayed across dashboard updates to selected org.

### ORG-002 – Create organization from UI
- Preconditions: Logged in.
- Steps:
  1. Visit organizations create page.
  2. Create a new org.
- Expected:
  - New org exists.
  - Creator becomes owner/admin.

### ORG-003 – Cross-tenant isolation
- Preconditions: U1 in Org A; U3 in Org B.
- Steps:
  1. As U1, attempt to access Org B resource IDs via URL (calls, KB, agents).
- Expected:
  - Access denied (401/403/404).
  - No data leakage in UI or API responses.

---

## 6) Team Members & Invitations

### TEAM-001 – List team members
- Preconditions: Org has members.
- Steps:
  1. Navigate to Team page.
- Expected:
  - Team list loads.
  - Members show correct roles/status.

### TEAM-002 – Invite team member (happy path)
- Preconditions: Admin user.
- Steps:
  1. Open “Add team member” modal.
  2. Enter invitee email and role.
  3. Send invite.
- Expected:
  - Invitation created.
  - UI confirms success.
  - Invitee can accept via invite flow.

### TEAM-003 – Invite team member (existing user)
- Preconditions: Invitee already exists in system.
- Steps:
  1. Invite existing email.
- Expected:
  - Either:
    - Adds membership directly, or
    - Sends invite but handles gracefully.
  - No duplicate memberships.

### TEAM-004 – Revoke/remove team member
- Preconditions: Admin user; multiple members.
- Steps:
  1. Remove a member.
- Expected:
  - Member loses access.
  - Member cannot access protected pages after refresh.

---

## 7) Dashboard (Metrics + Activity Feed)

### DASH-001 – Metrics load
- Preconditions: Logged in; org has calls.
- Steps:
  1. Open Dashboard home.
- Expected:
  - Metrics render with valid numbers.
  - No NaN/undefined display.

### DASH-002 – Activity feed loads
- Preconditions: Activity endpoint available.
- Steps:
  1. Load a page containing activity feed.
- Expected:
  - Shows latest entries.
  - If none exist: shows empty state.

### DASH-003 – Pagination/limit behavior (activity)
- Preconditions: ≥ 10 activities.
- Steps:
  1. Trigger activity fetch with `limit=5`.
- Expected:
  - Exactly 5 entries displayed.

---

## 8) Calls & Transcripts (UI)

### CALL-001 – Call logs page loads
- Preconditions: Org has calls.
- Steps:
  1. Navigate to Call Logs page.
- Expected:
  - Table loads.
  - Pagination controls appear when needed.

### CALL-002 – Call log search
- Preconditions: Known caller number or transcript keyword exists.
- Steps:
  1. Search for keyword.
- Expected:
  - Results filtered correctly.
  - Clearing search restores full list.

### CALL-003 – Filter by resolution status
- Preconditions: Calls exist with multiple statuses.
- Steps:
  1. Filter by “resolved”.
- Expected:
  - Only resolved calls display.

### CALL-004 – Open transcript modal
- Preconditions: Calls with transcripts.
- Steps:
  1. Open a call details/transcript modal.
- Expected:
  - Transcript displays fully.
  - Summary/sentiment (if present) displays.

### CALL-005 – Empty transcript handling
- Preconditions: Call record missing transcript.
- Steps:
  1. Open call details.
- Expected:
  - UI shows graceful empty state.
  - No crash.

### CALL-006 – Live transcript component (coming soon)
- Preconditions: A live call or mocked live events.
- Steps:
  1. Open live transcript UI.
  2. Stream transcript events.
- Expected:
  - Updates in real time.
  - No duplicated/out-of-order rendering beyond expected.

---

## 9) Voice Agents / AI Agents

### AGENT-001 – List agents
- Preconditions: Org has agents.
- Steps:
  1. Navigate to AI/Voice Agents page.
- Expected:
  - Agents list loads.
  - Correct statuses shown.

### AGENT-002 – Create agent (happy path)
- Preconditions: Billing allows creation (if enforced).
- Steps:
  1. Click “Add agent”.
  2. Fill required fields.
  3. Save.
- Expected:
  - Agent created.
  - Appears in list.
  - If Vapi-backed: remote Vapi resource created.

### AGENT-003 – Update agent
- Preconditions: Existing agent.
- Steps:
  1. Edit agent fields.
  2. Save.
- Expected:
  - Changes persist after refresh.
  - Remote sync occurs if applicable.

### AGENT-004 – Delete agent
- Preconditions: Existing agent.
- Steps:
  1. Delete agent.
- Expected:
  - Removed from list.
  - Remote Vapi resource deleted if applicable.

### AGENT-005 – Validation errors
- Preconditions: None.
- Steps:
  1. Submit create/edit with missing required fields.
- Expected:
  - Inline validation.
  - No resource created.

---

## 10) Knowledge Base (RAG)

### KB-001 – List knowledge bases
- Preconditions: Org has KBs.
- Steps:
  1. Navigate to Knowledge Base page.
- Expected:
  - KB list loads.
  - Each KB shows status/provider.

### KB-002 – Create knowledge base with files
- Preconditions: Valid Vapi API key.
- Steps:
  1. Click “Add knowledge base”.
  2. Provide name.
  3. Upload one or more files.
  4. Create.
- Expected:
  - Files upload successfully.
  - KB created.
  - UI reflects processing/synced state.

### KB-003 – Upload file (existing KB)
- Preconditions: Existing KB.
- Steps:
  1. Upload another file.
- Expected:
  - File record appears.
  - Status updates accordingly.

### KB-004 – Unsupported file type
- Preconditions: None.
- Steps:
  1. Try uploading an unsupported/invalid file.
- Expected:
  - Upload rejected with clear error.
  - No partial KB created.

### KB-005 – Large file upload (limits)
- Preconditions: Know max upload size.
- Steps:
  1. Upload near-limit file.
  2. Upload over-limit file.
- Expected:
  - Near-limit succeeds.
  - Over-limit fails with clear message.

### KB-006 – Delete file from KB
- Preconditions: Existing file.
- Steps:
  1. Delete file.
- Expected:
  - File removed from UI.
  - Remote Vapi file deleted if applicable.

### KB-007 – Delete knowledge base
- Preconditions: Existing KB.
- Steps:
  1. Delete KB.
- Expected:
  - KB removed from list.
  - Remote Vapi KB deleted if applicable.

---

## 11) Phone Numbers

### PN-001 – List phone numbers
- Preconditions: Org has phone numbers.
- Steps:
  1. Navigate to Phone Numbers page.
- Expected:
  - List loads.
  - Shows provider and linked agent.

### PN-002 – Provision/import phone number
- Preconditions: Provider credentials set (Vapi/Twilio).
- Steps:
  1. Add phone number.
  2. Provide required provider data.
- Expected:
  - Number created.
  - Stored in DB.

### PN-003 – Update phone number routing/assistant link
- Preconditions: Existing number and assistant.
- Steps:
  1. Link number to assistant.
  2. Save.
- Expected:
  - Link persists.
  - Inbound calls route to correct assistant.

### PN-004 – Delete phone number
- Preconditions: Existing number.
- Steps:
  1. Delete.
- Expected:
  - Removed from UI.
  - Remote provider resource removed if applicable.

---

## 12) Integrations (MCP/Webhook/CRM/Helpdesk)

### INT-001 – List integrations
- Preconditions: Org has integrations.
- Steps:
  1. Navigate to Integrations.
- Expected:
  - Integrations list loads.
  - Status displayed.

### INT-002 – Create MCP integration
- Preconditions: MCP endpoint reachable.
- Steps:
  1. Add integration.
  2. Choose type = `mcp`.
  3. Provide endpoint/config.
  4. Save.
- Expected:
  - Integration created.
  - Status becomes active (or shows error details).

### INT-003 – Sync integration
- Preconditions: Integration exists.
- Steps:
  1. Click Sync.
- Expected:
  - Success toast.
  - Status updates; last sync time updated (if shown).

### INT-004 – Integration validation
- Preconditions: None.
- Steps:
  1. Create with invalid URL.
- Expected:
  - Validation error.
  - No integration created.

### INT-005 – Integration failure state
- Preconditions: Create integration pointing to down endpoint.
- Steps:
  1. Sync.
- Expected:
  - Status becomes `error`.
  - Error messaging is shown.

---

## 13) Billing (Checkout, Subscription, Usage Enforcement)

### BILL-001 – View subscription status
- Preconditions: Logged in.
- Steps:
  1. Navigate to Billing page.
  2. Load subscription status.
- Expected:
  - Displays current plan/status.
  - If no subscription: shows CTA to subscribe.

### BILL-002 – Start subscription checkout
- Preconditions: Billing provider configured.
- Steps:
  1. Click Subscribe.
- Expected:
  - Calls `POST /api/billing/subscribe`.
  - Receives a checkout/payment link.
  - Browser redirects or shows link.

### BILL-003 – Purchase add-on
- Preconditions: Active subscription.
- Steps:
  1. Click purchase add-on.
- Expected:
  - Payment link/session created.
  - Usage limits updated after successful payment webhook.

### BILL-004 – Billing portal behavior
- Preconditions: Depends on provider.
- Steps:
  1. Click “Manage billing”.
- Expected:
  - If implemented: redirects to portal.
  - If not implemented: shows error message indicating not available.

### BILL-005 – Webhook idempotency (manual)
- Preconditions: Ability to send the same webhook twice.
- Steps:
  1. Send the same billing webhook event twice.
- Expected:
  - First updates subscription/usage.
  - Second does not duplicate changes.

### BILL-006 – Usage enforcement for provisioning/creation
- Preconditions: Set low limits for test company.
- Steps:
  1. Attempt to create more agents/numbers than allowed.
- Expected:
  - Operation blocked with clear message.
  - No partial resources created.

---

## 14) Security Page (Audit Logs, Exports, Sessions, Compliance Docs)

### SEC-001 – Security page loads
- Preconditions: Logged in.
- Steps:
  1. Visit Security page.
- Expected:
  - Sections render (2FA, audit logs, compliance).

### SEC-002 – Audit logs display
- Preconditions: audit logs exist.
- Steps:
  1. Load audit logs section.
- Expected:
  - Entries show actor/action/timestamp.
  - “No audit logs found” appears if empty.

### SEC-003 – Export audit logs to CSV
- Preconditions: audit logs exist.
- Steps:
  1. Click “Export CSV”.
- Expected:
  - Browser downloads `audit-logs-YYYY-MM-DD.csv`.
  - File contains headers and correct row count.
  - Success toast shows exported count.

### SEC-004 – Export audit logs to XLSX
- Preconditions: audit logs exist.
- Steps:
  1. Click “Export XLSX”.
- Expected:
  - Browser downloads `.xlsx` file.
  - Spreadsheet has expected columns and rows.
  - Success toast shows exported count.

### SEC-005 – Export when no audit logs
- Preconditions: zero logs.
- Steps:
  1. Click export.
- Expected:
  - No download.
  - Toast indicates “No data to export”.

### SEC-006 – Download compliance docs (UI behavior)
- Preconditions: Docs configured (or placeholders).
- Steps:
  1. Click “Download All Docs”.
- Expected:
  - Either downloads files or shows “not available” messaging.
  - Must not crash.

### SEC-007 – Sessions modal
- Preconditions: Logged in.
- Steps:
  1. Open sessions modal.
- Expected:
  - Lists active sessions.
  - Allows safe session invalidation if supported.

---

## 15) Admin / Internal Tools (if enabled)

### ADMIN-001 – Admin routes are protected
- Preconditions: Have non-admin user.
- Steps:
  1. Try to access `/api/admin/*` or admin pages.
- Expected:
  - Non-admin blocked.
  - Admin allowed.

---

## 16) Webhooks (Vapi/Twilio/Flutterwave) – Manual Verification

### WH-001 – Vapi webhook receives test payload
- Preconditions: Endpoint reachable.
- Steps:
  1. `POST /api/webhooks/vapi` with a minimal test body (as allowed by implementation).
- Expected:
  - HTTP 200 JSON indicates received.
  - Server logs show event handled.

### WH-002 – Vapi webhook creates/updates call record
- Preconditions: Real call or realistic event payload.
- Steps:
  1. Trigger Vapi end-of-call event.
  2. Open call logs.
- Expected:
  - New call appears.
  - Transcript/summary fields populated when available.

### WH-003 – Twilio webhook (if enabled)
- Preconditions: Twilio configured.
- Steps:
  1. Place a test call to Twilio number.
  2. Confirm webhook requests hit `/api/webhooks/twilio`.
- Expected:
  - Webhook requests succeed.
  - Call flow completes.

### WH-004 – Billing webhook updates subscription
- Preconditions: Billing provider configured.
- Steps:
  1. Send a billing success webhook.
- Expected:
  - Subscription status updates in UI.
  - Usage period created/updated.

---

## 17) API Manual Tests (Postman/curl)

> For each endpoint below, run both:
> - **Auth required test**: request without auth -> expect 401
> - **Happy path**: request with valid auth -> expect 200 + correct shape
> - **Cross-tenant**: use resource id from Org B while logged in to Org A -> expect 401/403/404

### API-001 – User profile
- Endpoint: `GET /api/user/profile`
- Expected:
  - Without auth: 401.
  - With auth: 200 envelope with user fields.

### API-002 – Update user profile
- Endpoint: `PUT /api/user/profile`
- Expected:
  - Valid updates persist.
  - Invalid payload returns 400.

### API-003 – User preferences
- Endpoint: `/api/user/preferences`
- Expected:
  - Preferences persist across refresh.

### API-004 – Security settings
- Endpoint: `/api/security/settings`
- Expected:
  - Toggle 2FA enforcement persists.

### API-005 – Audit logs
- Endpoint: `/api/security/audit-logs`
- Expected:
  - Returns paginated logs for the company.

### API-006 – Calls list and details
- Endpoints: `GET /api/calls`, `GET /api/calls/[id]`
- Expected:
  - Pagination works; `totalPages` correct.
  - Call detail returns transcript/metadata.

### API-007 – Integrations
- Endpoints: `GET /api/integrations`, `POST /api/integrations`, `POST /api/integrations/[id]/sync`, CRUD by id
- Expected:
  - Create validates inputs.
  - Sync changes status.

### API-008 – Vapi management endpoints
- Endpoints: `/api/vapi/assistants`, `/api/vapi/knowledge-bases`, `/api/vapi/phone-numbers` (+ id/file subroutes)
- Expected:
  - Creates remote resources and DB metadata.
  - Deleting cleans up remote + DB.

### API-009 – Organizations
- Endpoints: `/api/organizations/*`
- Expected:
  - Correct membership enforcement.

### API-010 – Team members
- Endpoints: `/api/team-members/*`
- Expected:
  - Only admins can invite/remove.

### API-011 – Dashboard metrics and activity
- Endpoints: `/api/dashboard/metrics`, `/api/dashboard/activity`
- Expected:
  - Metrics reflect current data.
  - Activity returns most recent entries.

### API-012 – Billing
- Endpoints: `/api/billing/*`
- Expected:
  - Returns clear error if not configured.
  - If configured: returns checkout/payment links and correct subscription state.

---

## 18) UI/UX Quality (Accessibility, Responsiveness, Error States)

### UX-001 – Keyboard navigation
- Preconditions: None.
- Steps:
  1. Use Tab/Shift+Tab to navigate forms and modals.
- Expected:
  - Focus order is logical.
  - Visible focus indicator.
  - Enter/Space activates buttons.

### UX-002 – Modal focus trap
- Preconditions: Any modal.
- Steps:
  1. Open modal.
  2. Press Tab repeatedly.
- Expected:
  - Focus remains within modal.
  - Esc closes modal if intended.

### UX-003 – Responsive layout
- Preconditions: None.
- Steps:
  1. Test at 375px width and 1440px width.
- Expected:
  - Sidebar/nav usable.
  - Tables scroll appropriately.

### UX-004 – Loading and empty states
- Preconditions: Force empty datasets.
- Steps:
  1. Visit each list page with no data.
- Expected:
  - Shows friendly empty state.
  - No errors or broken layout.

### UX-005 – Error toasts/messages
- Preconditions: Force API error (disable network).
- Steps:
  1. Trigger action requiring API.
- Expected:
  - Clear error toast/message.
  - UI remains usable.

---

## 19) Security & Privacy (Manual Checks)

### SECCHK-001 – Sensitive data not logged in UI
- Steps:
  1. Inspect audit logs and UI outputs.
- Expected:
  - No secrets (API keys, tokens) displayed.

### SECCHK-002 – RLS enforcement (cross-tenant)
- Steps:
  1. Attempt to access another company’s resources by ID.
- Expected:
  - Data is not returned.
  - Server returns 401/403/404.

### SECCHK-003 – XSS attempt in user-controlled fields
- Steps:
  1. Enter `<script>alert(1)</script>` into name fields (where allowed).
  2. View it in lists/headers.
- Expected:
  - Script does not execute.
  - Value is escaped/sanitized.

### SECCHK-004 – CSRF basics
- Steps:
  1. Attempt state-changing requests from a different origin (manual via curl doesn’t simulate browser CSRF perfectly).
- Expected:
  - If CSRF protection exists: request blocked.
  - If not: at minimum, cookies are SameSite-protected in production.

---

## 20) Performance/Resilience (Manual)

### PERF-001 – Large dataset pages
- Preconditions: ≥ 1,000 calls.
- Steps:
  1. Load call logs.
- Expected:
  - Page loads within acceptable time.
  - Pagination remains responsive.

### PERF-002 – Slow network
- Steps:
  1. Use DevTools network throttling (Slow 3G).
  2. Load dashboard.
- Expected:
  - Loading indicators show.
  - No infinite spinners.

### PERF-003 – Concurrent actions
- Steps:
  1. Click “create” twice quickly.
- Expected:
  - Only one resource created, or second click blocked.
  - UI shows deterministic outcome.

---

## 21) Deployment Verification (Production/Staging)

### DEP-001 – Full user flow
- Steps:
  1. New user signup/login.
  2. Complete onboarding.
  3. Create KB + upload file.
  4. Create agent.
  5. Provision phone number.
  6. Place a test call.
- Expected:
  - All steps succeed without manual DB edits.
  - Call appears in call logs with transcript/summary.

### DEP-002 – Webhook reachability
- Steps:
  1. Trigger webhook events from Vapi.
- Expected:
  - Events received successfully (2xx).
  - No 404/500 in provider logs.

---

## Completion Criteria
A release candidate should meet:
- 100% pass on Smoke + Auth + Onboarding + Calls + KB + Agents + Security essentials.
- No cross-tenant data leakage in any tested path.
- Webhooks stable and idempotent under retries.
