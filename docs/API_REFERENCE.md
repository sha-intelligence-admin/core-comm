# CoreComm API Reference

This document describes the HTTP API routes implemented in this repository (Next.js App Router), including request parameters and response bodies.

> Scope
> - Routes live under `app/api/**/route.ts`.
> - Authentication is handled via Supabase sessions (typically cookie-based in the browser).
> - Some responses use a common `{ data, message }` envelope, but many endpoints return custom shapes.

---

## Base URL

- **Base path:** `/api`
- **Examples in this doc** assume the same origin as the Next.js app.

## Authentication

Most endpoints require an authenticated Supabase user session.

- If unauthenticated, endpoints typically return **401** with one of:
  - `{ "error": "Unauthorized" }`
  - `{ "error": "Authentication required" }`
  - `{ "error": "Not authenticated", "details": string | undefined }`

## Common response envelopes (not universal)

Some endpoints use helpers from `lib/supabase/api.ts`:

- **Success:**
  ```json
  { "data": { /* ... */ }, "message": "..." }
  ```

- **Error:**
  ```json
  { "error": "..." }
  ```

Endpoints that use `NextResponse.json(...)` may not follow this envelope.

## Pagination

Where supported, pagination is typically:

- Query params: `page` (1-based), `limit`
- Response:
  ```json
  {
    "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
  }
  ```

---

# Endpoints

## Health

### GET /api/health

Returns the monitoring/health status.

- **Auth:** Not required
- **Response (200 or 503):**
  - On success, returns whatever `monitoring.getHealthStatus()` produces.
  - On failure (503), returns:

```json
{
  "status": "unhealthy",
  "checks": {
    "service": {
      "status": "fail",
      "message": "Health check service error"
    }
  },
  "timestamp": 1735600000000,
  "version": "1.0.0"
}
```

---

## CSRF

### GET /api/csrf

Generates a CSRF token and sets a CSRF cookie.

- **Auth:** Not required
- **Response (200):**

```json
{ "token": "<csrf-token>", "message": "CSRF token generated successfully" }
```

- **Headers:** `Set-Cookie` is set with the CSRF cookie.

---

## Auth & Invites

### GET /api/auth/check-profile

Diagnostic endpoint to verify Supabase auth and whether a `users` profile row exists.

- **Auth:** Required
- **Response (200):**

```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "email": "...",
    "email_confirmed_at": "...",
    "user_metadata": {}
  },
  "profile": { /* users row */ },
  "profileError": null,
  "hasProfile": true,
  "hasCompanyId": true
}
```

- **Response (401):**

```json
{ "error": "Not authenticated", "details": "..." }
```

### POST /api/auth/signup

Creates a user profile row in the `users` table using the Supabase **service role**.

- **Auth:** Not required (this is profile creation, not auth signup)
- **Body:**

```json
{
  "userId": "<supabase-auth-user-id>",
  "email": "user@example.com",
  "fullName": "Jane Doe",
  "phone": "+15551234567"
}
```

- **Validation:** uses `CreateUserProfileSchema` (email, full_name required; phone optional)
- **Response (200, envelope):**

```json
{
  "data": { "user": { /* inserted users row */ } },
  "message": "User profile created successfully"
}
```

- **Errors:**
  - 400: `{ "error": "User ID is required" }` or `{ "error": "Invalid request data" }`
  - 409: `{ "error": "User profile already exists" }`
  - 500: `{ "error": "Failed to create user profile" }`

### POST /api/auth/verify-invite

Validates an invitation token from `organization_invitations`.

- **Auth:** Not required
- **Body:**

```json
{ "token": "<invitation_token>" }
```

- **Response (200):**

```json
{
  "email": "invitee@example.com",
  "fullName": "Optional Name",
  "companyName": "the organization",
  "role": "admin"
}
```

- **Errors:**
  - 400: missing token or expired invite
  - 404: invalid/expired invitation

### POST /api/auth/accept-invite

Accepts an invitation by:
- creating a Supabase auth user (admin API)
- creating a `users` profile
- creating `organization_memberships` and `team_members` entries
- marking invitation accepted
- attempting an auto-login (`signInWithPassword`)

- **Auth:** Not required
- **Body:**

```json
{
  "token": "<invitation_token>",
  "password": "<password>",
  "fullName": "<full name>"
}
```

- **Response (200):**
  - Success: `{ "success": true }`
  - If auto-login fails: `{ "success": true, "message": "Account created. Please log in." }`

- **Errors:**
  - 400: `{ "error": "Missing required fields" }` / `{ "error": "Invalid invitation" }` / `{ "error": "<supabase admin error message>" }`
  - 500: `{ "error": "Internal server error" }`

---

## User

### GET /api/user/profile

Returns the current user's profile.

- **Auth:** Required
- **Response (200, envelope):**

```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "created_at": "...",
      "updated_at": "...",
      "full_name": "...",
      "avatar_url": null,
      "phone": null,
      "role": "admin",
      "is_active": true,
      "company_id": "..."
    }
  },
  "message": "Profile fetched successfully"
}
```

- **Errors:** 401, 404, 500 with `{ "error": "..." }`.

### PUT /api/user/profile

Updates the current user's profile fields.

- **Auth:** Required
- **Body:**

```json
{
  "full_name": "Optional Name",
  "phone": "+15551234567",
  "avatar_url": "https://..."
}
```

- **Response (200, envelope):** `{ "data": { "user": { /* updated */ } }, "message": "Profile updated successfully" }`

### GET /api/user/preferences

Fetches the user's preferences from `users.metadata.preferences`.

- **Auth:** Required
- **Response (200):**

```json
{ "success": true, "data": { /* preferences object */ } }
```

### POST /api/user/preferences

Merges incoming preferences into `users.metadata.preferences`.

- **Auth:** Required
- **Body:**

```json
{ "preferences": { "theme": "dark" } }
```

- **Response (200):**

```json
{ "success": true, "message": "Preferences updated successfully" }
```

---

## Organizations

### GET /api/organizations

Lists organizations for the current user via `organization_memberships`.

- **Auth:** Required
- **Response (200):**

```json
{
  "companies": [
    {
      "id": "...",
      "name": "...",
      "company_size": "small",
      "member_key": "...",
      "industry": "...",
      "timezone": "UTC",
      "member_count": 0,
      "membership_role": "owner",
      "membership_status": "active",
      "is_default": true,
      "joined_at": "...",
      "last_accessed": "..."
    }
  ]
}
```

### POST /api/organizations/select

Switches the active organization for the current user.

- **Auth:** Required
- **Body:**

```json
{ "companyId": "<company uuid>" }
```

- **Side effects:**
  - updates `users.company_id`
  - updates `organization_memberships.last_accessed_at`
  - sets `selected_company_id` cookie

- **Response (200):** `{ "success": true }`

### POST /api/organizations/create

Creates a company + owner membership, initializes billing wallet/subscription, provisions phone numbers (Twilio), optionally creates Vapi assistant and links phone number, and creates records for backward compatibility.

- **Auth:** Required
- **Body (selected fields, all are accepted by the route):**

```json
{
  "companyName": "Acme Inc",
  "description": "Optional",
  "companySize": "small",
  "industry": "SaaS",
  "supportVolume": "Optional",
  "currentSolution": "Optional",

  "phoneNumber": "+15551234567",
  "phoneNumberSource": "twilio-new | forward-existing | twilio-user-managed",
  "regionPreference": "Optional",

  "businessHours": "custom | ...",
  "customHours": { "mon": "9-5" },
  "timezone": "UTC",

  "primaryGoals": ["reduce tickets"],
  "expectedVolume": 100,
  "successMetrics": "Optional",

  "integrationName": "Optional",
  "mcpEndpoint": "https://...",

  "knowledgeBase": "Optional",

  "assistantName": "Optional",
  "assistantDescription": "Optional",
  "assistantModel": "gpt-4o-mini | claude-...",
  "assistantVoiceProvider": "11labs | openai | ...",
  "assistantVoiceId": "Optional",
  "assistantGreeting": "Optional",
  "assistantLanguage": "en-US",
  "assistantPersonality": "Optional"
}
```

- **Required fields:** `companyName`, `companySize`, `industry`.
- **Response (200):**

```json
{
  "success": true,
  "company": {
    "id": "...",
    "name": "...",
    "industry": "...",
    "onboarding_completed": true,
    "setup_steps_completed": { "basics": true, "phone": true, "integration": true, "assistant": true, "goals": true }
  },
  "membership": { "role": "owner", "is_default": true },
  "is_first_organization": true
}
```

---

## Onboarding

### POST /api/onboarding

Creates a new company for a user that does not already have a `company_id`, provisions Twilio (optional), creates a default Vapi assistant (required), and returns created IDs.

- **Auth:** Required
- **Body:** same overall shape as `/api/organizations/create`.
- **Response (201):**

```json
{
  "success": true,
  "company": { "id": "...", "name": "...", "memberKey": "..." },
  "assistant": { "id": "...", "name": "...", "vapiAssistantId": "..." }
}
```

---

## Team Members

### GET /api/team-members

Lists team members and merges in pending invitations from `organization_invitations`.

- **Auth:** Required
- **Query params:** `page`, `limit`, `status`, `role`, `department`, `search`
- **Response (200):**

```json
{
  "members": [ /* team_members rows + synthesized invite entries */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### POST /api/team-members

Invites a new team member.

- **Auth:** Required
- **Body:**

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin | manager | agent | viewer | developer",
  "department": "Optional",
  "status": "invited",

  "phone_number": "Optional",
  "avatar_url": "https://...",
  "timezone": "Optional",

  "permissions": {},
  "can_access_analytics": false,
  "can_manage_integrations": false,
  "can_manage_team": false,
  "can_manage_agents": false,
  "can_view_calls": true,
  "can_view_messages": true,
  "can_view_emails": true,

  "notes": "Optional",
  "config": {}
}
```

- **Response (201):**
  - For a new user invitation: returns a synthesized member with `inviteLink` and `emailSent`.
  - For an existing user: returns the inserted `team_members` row plus `inviteLink` and `emailSent`.

### PUT /api/team-members/[id]

Updates a team member.

- **Auth:** Required
- **Body:** partial of the POST body.
- **Response (200):** returns the updated row (no envelope).

### DELETE /api/team-members/[id]

Deletes a team member.

- **Auth:** Required
- **Response (200):** `{ "success": true }`

### POST /api/team-members/resend

Resends an invitation email for a team member in `status = invited`.

- **Auth:** Required
- **Body:** `{ "email": "invitee@example.com" }`
- **Response (200):** `{ "success": true, "inviteLink": "..." }`

---

## Calls

### GET /api/calls

Lists calls for the current company.

- **Auth:** Required
- **Query params (validated):**
  - `page` (default 1)
  - `limit` (default 10)
  - `resolution_status`: `pending | resolved | escalated | failed`
  - `call_type`: `inbound | outbound`
  - `priority`: `low | medium | high | urgent`
  - `search`: string

- **Response (200, envelope):**

```json
{
  "data": {
    "calls": [ /* calls rows */ ],
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

### POST /api/calls

Creates a call record.

- **Auth:** Required
- **Body (validated):**

```json
{
  "caller_number": "+15551234567",
  "recipient_number": "+15557654321",
  "duration": 0,
  "transcript": "Optional",
  "resolution_status": "pending",
  "call_type": "inbound",
  "summary": "Optional",
  "sentiment": "positive | neutral | negative",
  "priority": "medium"
}
```

- **Response (200, envelope):** `{ "data": { /* inserted call row */ }, "message": "Call created successfully" }`

### GET /api/calls/[id]

Fetch a single call by id (scoped to company).

- **Auth:** Required
- **Response (200, envelope):** `{ "data": { /* call row */ } }`

### PUT /api/calls/[id]

Updates a call.

- **Auth:** Required
- **Body:** partial of the create schema.
- **Response (200, envelope):** `{ "data": { /* updated call row */ }, "message": "Call updated successfully" }`

### DELETE /api/calls/[id]

Deletes a call.

- **Auth:** Required
- **Response (200, envelope):** `{ "data": null, "message": "Call deleted successfully" }`

---

## Dashboard

### GET /api/dashboard/metrics

Returns call and agent metrics for the active company.

- **Auth:** Required
- **Response (200):**

```json
{
  "metrics": {
    "totalCalls": 0,
    "resolvedCalls": 0,
    "avgDuration": "0m 0s",
    "avgDurationSeconds": 0,
    "mcpActions": 0,
    "activeCalls": 0,
    "activeAgents": 0,
    "successRate": 0
  }
}
```

### GET /api/dashboard/activity

Returns the most recent calls.

- **Auth:** Required
- **Query params:** `limit` (default 10)
- **Response (200):** `{ "calls": [ /* calls rows */ ] }`

---

## Integrations

### GET /api/integrations

List integrations for the active company.

- **Auth:** Required
- **Query params (validated):**
  - `page` (default 1)
  - `limit` (default 10)
  - `type`: `mcp | webhook | api | crm | helpdesk`
  - `status`: `active | inactive | error | pending`
  - `search`: string

- **Response (200, envelope):**

```json
{
  "data": {
    "integrations": [ /* integrations rows */ ],
    "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
  }
}
```

### POST /api/integrations

Create a new integration.

- **Auth:** Required
- **Body (validated):**

```json
{
  "name": "My Integration",
  "type": "mcp | webhook | api | crm | helpdesk",
  "endpoint_url": "https://...",
  "description": "Optional",
  "status": "active",
  "config": {}
}
```

- **Behavior:** validates config + tests connection via `IntegrationFactory` provider.
- **Response (200, envelope):** `{ "data": { /* inserted integration row */ }, "message": "Integration created successfully" }`

### POST /api/integrations/[id]/sync

Triggers a manual sync for an integration type that supports it.

- **Auth:** Required
- **Response (200, envelope):** `{ "data": null, "message": "Sync started successfully" }`

### POST /api/integrations/test

Lightweight connection test endpoint (does not store integration).

- **Auth:** Not required
- **Body:**

```json
{ "type": "mcp|webhook|api|crm|helpdesk", "endpoint": "https://...", "apiKey": "..." }
```

- **Response (200):** `{ "success": true, "message": "Connection successful" }`

---

## Messaging Channels

### GET /api/messaging-channels

Lists messaging channels.

- **Auth:** Required
- **Query params:** `page`, `limit`, `status`, `channel_type`, `search`
- **Response (200):**

```json
{
  "channels": [ /* messaging_channels rows */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### POST /api/messaging-channels

Creates a messaging channel.

- **Auth:** Required
- **Body (validated):**

```json
{
  "channel_name": "Support",
  "channel_type": "whatsapp|telegram|messenger|slack|discord|sms|webchat",
  "provider": "twilio",
  "status": "active|inactive|suspended|pending|error",
  "phone_number": "Optional",
  "api_key": "Optional",
  "webhook_url": "https://...",
  "config": {}
}
```

- **Response (201):** `{ "channel": { /* inserted row */ } }`

### PUT /api/messaging-channels/[id]

Updates a messaging channel.

- **Auth:** Required
- **Body:** partial of the create body, plus optional stats fields.
- **Response (200):** `{ "channel": { /* updated row */ } }`

### DELETE /api/messaging-channels/[id]

Deletes a messaging channel.

- **Auth:** Required
- **Response (200):** `{ "message": "Messaging channel deleted successfully" }`

### POST /api/messaging-channels/test

Basic credentials verification.

- **Auth:** Not required
- **Body:** `{ "platform": "whatsapp|...", "accessToken": "...", "provider": "..." }`
- **Response (200):** `{ "success": true, "message": "Channel credentials verified" }`

---

## Voice Agents (DB-backed)

### GET /api/voice-agents

Lists voice agents.

- **Auth:** Required
- **Query params:** `page`, `limit`, `status`, `search`
- **Response (200):

```json
{
  "agents": [ /* voice_agents rows */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### POST /api/voice-agents

Creates a voice agent record.

- **Auth:** Required
- **Body:**

```json
{
  "name": "Agent",
  "description": "Optional",
  "type": "voice|messaging|email|workspace",
  "voice_model": "Optional",
  "personality": "Optional",
  "language": "en-US",
  "status": "active|inactive|training|error",
  "greeting_message": "Optional",
  "knowledge_base_id": "<uuid>",
  "config": {}
}
```

- **Response (201):** `{ "agent": { /* inserted row */ } }`

### PUT /api/voice-agents/[id]

Updates a voice agent record.

- **Auth:** Required
- **Response (200):** `{ "agent": { /* updated */ } }`

### DELETE /api/voice-agents/[id]

Deletes a voice agent record.

- **Auth:** Required
- **Response (200):** `{ "message": "Voice agent deleted successfully" }`

---

## Phone Numbers (DB-backed)

### GET /api/phone-numbers

Lists phone numbers.

- **Auth:** Required
- **Query params:** `page`, `limit`, `status`, `provider`, `search`
- **Response (200):

```json
{
  "phoneNumbers": [ /* phone_numbers rows */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### POST /api/phone-numbers

Creates a phone number record (does not provision externally).

- **Auth:** Required
- **Body (validated):**

```json
{
  "phone_number": "+15551234567",
  "country_code": "+1",
  "provider": "twilio",
  "number_type": "voice|sms|both",
  "status": "active|inactive|suspended|pending",
  "friendly_name": "Optional",
  "capabilities": { "voice": true, "sms": true, "mms": false },
  "assigned_to": "Optional",
  "monthly_cost": 0,
  "config": {}
}
```

- **Response (201):** `{ "phoneNumber": { /* inserted row */ } }`

### PUT /api/phone-numbers/[id]

Updates a phone number record.

- **Auth:** Required
- **Response (200):** `{ "phoneNumber": { /* updated */ } }`

### DELETE /api/phone-numbers/[id]

Deletes a phone number record.

- **Auth:** Required
- **Response (200):** `{ "message": "Phone number deleted successfully" }`

---

## Email Accounts

### GET /api/email-accounts

Lists email accounts.

- **Auth:** Required
- **Query params:** `page`, `limit`, `status`, `provider`, `search`
- **Response (200):

```json
{
  "accounts": [ /* email_accounts rows */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

### POST /api/email-accounts

Creates an email account.

- **Auth:** Required
- **Body:** SMTP/IMAP/OAuth fields as supported by the endpoint.
- **Response (201):** returns the inserted row (no envelope).

### PUT /api/email-accounts/[id]

Updates an email account.

- **Auth:** Required
- **Response (200):** returns the updated row.

### DELETE /api/email-accounts/[id]

Deletes an email account.

- **Auth:** Required
- **Response (200):** `{ "success": true }`

---

## Security

### GET /api/security/settings

Gets (or initializes) `security_settings` for the active company.

- **Auth:** Required
- **Response (200, envelope):** `{ "data": { "settings": { /* security_settings row */ } } }`

### PATCH /api/security/settings

Updates security settings (admin-only).

- **Auth:** Required
- **Body:**

```json
{
  "two_factor_enabled": true,
  "allowed_auth_methods": ["password", "oauth"],
  "ip_whitelist": ["1.2.3.4/32"]
}
```

- **Response (200, envelope):** `{ "data": { "settings": { /* updated */ } } }`

### GET /api/security/audit-logs

Lists audit logs.

- **Auth:** Required
- **Query params:** `page` (default 1), `limit` (default 20)
- **Response (200, envelope):**

```json
{
  "data": {
    "logs": [ /* audit_logs rows */ ],
    "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
  }
}
```

---

## Billing (Flutterwave)

### POST /api/billing/create-checkout-session

Creates a Flutterwave payment link (one-time top-up) or creates a subscription via Flutterwave APIs.

- **Auth:** Required
- **Body:**

```json
{
  "companyId": "...",
  "mode": "subscription | payment",

  "priceId": "starter | growth | scale",
  "quantity": 1,

  "amount": 5000,

  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

- **Response:**
  - mode=`subscription`: `{ "subscriptionId": "<flutterwave subscription id>" }`
  - mode=`payment`: `{ "url": "<payment link>" }`

### POST /api/billing/subscribe

Creates a Flutterwave subscription payment link for a selected plan.

- **Auth:** Required
- **Body:** `{ "companyId": "...", "planId": "starter|growth|scale|..." }`
- **Response (200):** `{ "link": "https://..." }`

### POST /api/billing/purchase-addon

Purchases an add-on by deducting wallet balance.

- **Auth:** Not enforced in code (but uses Supabase client). Treat as requiring auth in practice.
- **Body:** `{ "companyId": "...", "addonId": "..." }`
- **Response (200):** `{ "success": true }`
- **Errors:** 402 if insufficient funds.

### POST /api/billing/subscription/[id]/cancel

Cancels a subscription.

- **Auth:** Required
- **Path params:** `id` = provider subscription id (stored in `billing_subscriptions.stripe_subscription_id`)
- **Response (200):** `{ "canceled": true, "providerResponse": { /* flutterwave response */ } }`

### POST /api/billing/portal

Not implemented for Flutterwave.

- **Auth:** Required
- **Response (501):**

```json
{ "error": "Not implemented: Flutterwave does not provide a hosted billing portal. Use app billing UI or create payment links." }
```

---

## Vapi (Management API)

These endpoints manage Vapi resources (assistants, knowledge bases, phone numbers) and typically return the `{ data, message }` envelope.

### GET /api/vapi/assistants

- **Auth:** Required
- **Response (200, envelope):** `{ "data": { "assistants": [ /* ... */ ] } }`

### POST /api/vapi/assistants

- **Auth:** Required (admin/owner)
- **Body:**

```json
{
  "name": "Assistant",
  "description": "Optional",
  "systemPrompt": "...",
  "firstMessage": "...",
  "language": "en",
  "model": { "provider": "openai|anthropic|google|groq", "model": "...", "temperature": 0.7, "maxTokens": 123, "knowledgeBaseId": "..." },
  "voice": { "provider": "elevenlabs|playht|azure|deepgram", "voiceId": "...", "speed": 1.0, "stability": 0.5 },
  "transcriber": { "provider": "deepgram", "model": "nova-2", "language": "en" },
  "serverUrl": "https://...",
  "knowledgeBaseId": "<uuid>"
}
```

- **Response (200, envelope):** `{ "data": { "assistant": { /* ... */ } }, "message": "Assistant created successfully" }`

### GET /api/vapi/assistants/[id]

- **Auth:** Required
- **Response (200, envelope):** `{ "data": { "assistant": { /* ... */ }, "stats": { /* ... */ } } }`

### PATCH /api/vapi/assistants/[id]

- **Auth:** Required (admin/owner)
- **Body:** partial of create body.
- **Response:** `{ "data": { "assistant": { /* updated */ } }, "message": "Assistant updated successfully" }`

### DELETE /api/vapi/assistants/[id]

- **Auth:** Required (admin/owner)
- **Response:** `{ "data": null, "message": "Assistant deleted successfully" }`

### GET /api/vapi/knowledge-bases

- **Auth:** Required
- **Response:** `{ "data": { "knowledgeBases": [ /* ... */ ] } }`

### POST /api/vapi/knowledge-bases

Supports JSON or `multipart/form-data`.

- **Auth:** Required (admin/owner)
- **Content-Type:**
  - `application/json` OR
  - `multipart/form-data` with fields `name`, `description`, `provider`, and optional `files`.

- **Response:** `{ "data": { "knowledgeBase": { /* ... */ } }, "message": "Knowledge base created successfully" }`

### GET /api/vapi/knowledge-bases/[id]

- **Auth:** Required
- **Response:** `{ "data": { "knowledgeBase": { /* ... */ } } }`

### PATCH /api/vapi/knowledge-bases/[id]

- **Auth:** Required (admin/owner)
- **Response:** `{ "data": { "knowledgeBase": { /* updated */ } }, "message": "Knowledge base updated successfully" }`

### DELETE /api/vapi/knowledge-bases/[id]

- **Auth:** Required (admin/owner)
- **Response:** `{ "data": null, "message": "Knowledge base deleted successfully" }`

### GET /api/vapi/knowledge-bases/[id]/files

- **Auth:** Required
- **Response:** `{ "data": { "files": [ /* ... */ ] } }`

### POST /api/vapi/knowledge-bases/[id]/files

Uploads a single file.

- **Auth:** Required (admin/owner)
- **Content-Type:** `multipart/form-data`
- **Form fields:** `file` (required)
- **Validation:** max 10MB; extensions limited; MIME checked.
- **Response:**

```json
{
  "data": { "file": { /* ... */ }, "warning": "Optional" },
  "message": "File uploaded successfully"
}
```

### DELETE /api/vapi/knowledge-bases/[id]/files?fileId=...

- **Auth:** Required (admin/owner)
- **Query params:** `fileId` (required)
- **Response:** `{ "data": null, "message": "File deleted successfully" }`

### GET /api/vapi/phone-numbers

- **Auth:** Required
- **Response:** `{ "data": { "phoneNumbers": [ /* ... */ ] } }`

### POST /api/vapi/phone-numbers

Provisions/imports a Vapi phone number.

- **Auth:** Required (admin/owner)
- **Body (validated):**

```json
{
  "provider": "vapi|twilio|vonage|telnyx|byo",
  "assistantId": "<uuid>",
  "areaCode": "415",
  "number": "+15551234567",
  "fallbackNumber": "+15557654321",
  "twilioAccountSid": "...",
  "twilioAuthToken": "..."
}
```

- **Response:** `{ "data": { "phoneNumber": { /* ... */ } }, "message": "Phone number provisioned successfully" }`

### GET /api/vapi/phone-numbers/[id]

- **Auth:** Required
- **Response:** `{ "data": { "phoneNumber": { /* ... */ }, "stats": { /* ... */ } } }`

### PATCH /api/vapi/phone-numbers/[id]

- **Auth:** Required (admin/owner)
- **Body:** `{ "assistantId": "<uuid>", "isActive": true }` (both optional)
- **Response:** `{ "data": { "phoneNumber": { /* updated */ } }, "message": "Phone number updated successfully" }`

### DELETE /api/vapi/phone-numbers/[id]

- **Auth:** Required (admin/owner)
- **Response:** `{ "data": null, "message": "Phone number deleted successfully" }`

---

## Webhooks

### POST /api/webhooks/vapi

Handles Vapi webhook events.

- **Auth:** Not required
- **Headers:**
  - `x-vapi-signature` (optional)
  - `VAPI_WEBHOOK_SECRET` env var enables signature verification (currently TODO in code)

- **Body:** `WebhookPayload` (see `lib/vapi/types`). Code expects `payload.message.type` and message-specific fields.

- **Supported message.type values:**
  - `assistant-request`
  - `status-update`
  - `end-of-call-report`
  - `function-call`
  - `transcript`

- **Response:** uses `{ data, message }` envelope (from `createSuccessResponse`).
  - For `assistant-request`, returns assistant config under `data.assistant`.
  - For `function-call`, returns `data.result`.
  - For others, returns `{ "data": { "received": true } }`.

### POST /api/webhooks/flutterwave

Processes Flutterwave payment/subscription webhooks and updates local billing tables.

- **Auth:** Not required
- **Signature headers (checked):**
  - `verif-hash` OR `x-flutterwave-signature`

- **Body:** raw JSON (must parse)
- **Behavior:**
  - attempts idempotency by storing `event_id` in `webhook_events`
  - handles event types like `charge.completed`, `subscription.charge.success`, `subscription.updated`, `subscription.cancelled`

- **Response:**
  - `200` on success (empty body)
  - `400` for invalid signature/payload
  - `500` on processing failure

### POST /api/webhooks/twilio/sms

Handles incoming SMS messages from Twilio.

- **Auth:** Not required (Twilio signature validation recommended but not currently enforced in code).
- **Content-Type:** `application/x-www-form-urlencoded`
- **Body:** Standard Twilio SMS parameters (`From`, `Body`, `MessageSid`, etc.).
- **Response:** TwiML XML.

### POST /api/webhooks/twilio/voice

Handles incoming voice calls from Twilio.

- **Auth:** Not required.
- **Content-Type:** `application/x-www-form-urlencoded`
- **Body:** Standard Twilio Voice parameters (`CallSid`, `From`, `To`, etc.).
- **Response:** TwiML XML.

---

## Admin

### GET /api/admin/migrate

Checks whether the users table has migration columns (`onboarding_completed`, `metadata`).

- **Auth:** Not protected in code; should be treated as admin-only.

### POST /api/admin/migrate

Runs migrations via `supabase.rpc('exec', { sql })`.

- **Auth:** Not protected in code; should be treated as admin-only.

---

# Notes & Gaps

- Several endpoints return `select('*')` data; exact column sets come from the database schema. Where relevant, refer to the generated types in `lib/supabase/types.ts`.
