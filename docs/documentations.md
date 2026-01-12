# CoreComm AI Documentation

## 1. Introduction

CoreComm is an AI-powered, voice-first customer support solution designed to handle incoming phone calls with a conversational AI agent. It leverages advanced speech recognition, natural language understanding, and retrieval-augmented generation (RAG) to provide accurate, context-aware support.

## 2. Architecture Overview

The application is built using a modern web stack:

- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript.
- **Database & Auth**: Supabase (PostgreSQL + Auth).
- **Styling**: Tailwind CSS + Radix UI.
- **AI & Telephony**: Vapi.ai (Voice AI orchestration), Twilio (Telephony provider).
- **Integrations**: MCP (Model Context Protocol) for external actions.

### High-Level Data Flow

1.  **Call Ingress**: Call arrives via Twilio/SIP.
2.  **Voice Processing**: Vapi.ai handles STT (Speech-to-Text) and TTS (Text-to-Speech).
3.  **AI Orchestration**: Vapi sends the transcript to the configured LLM (e.g., GPT-4o).
4.  **Context Retrieval (RAG)**: Relevant knowledge is fetched from Vapi Knowledge Bases (powered by Trieve).
5.  **Action Execution**: If needed, the AI triggers tools/actions via MCP integrations.
6.  **Response**: The AI generates a response, which is converted to speech and played back to the caller.

## 3. AI & Voice Pipeline

### 3.1 Vapi Integration (`lib/vapi/`)

CoreComm uses the `@vapi-ai/server-sdk` to interact with the Vapi API.

-   **Client**: `lib/vapi/client.ts` initializes the `VapiClient` using `VAPI_API_KEY`.
-   **Defaults**:
    -   Model: `gpt-4o` (configurable via `VAPI_DEFAULT_MODEL`)
    -   Voice Provider: `elevenlabs` (configurable via `VAPI_DEFAULT_VOICE_PROVIDER`)
    -   Phone Provider: `vapi` or `twilio`

### 3.2 Knowledge Base (RAG)

The RAG system is implemented in `lib/vapi/knowledge-bases.ts`.

-   **Creation Process**:
    1.  Files are uploaded to Vapi using `vapi.files.create`.
    2.  A Knowledge Base is created on Vapi referencing these file IDs (provider: `trieve`).
    3.  Metadata is stored in the local Supabase table `vapi_knowledge_bases`.
-   **Usage**: When a call is active, the AI agent uses this Knowledge Base to ground its responses in the uploaded documents.

### 3.3 Integrations & MCP

Integrations are managed via the `integrations` table in Supabase. Supported types include:
-   `mcp`: Model Context Protocol servers.
-   `webhook`: Standard webhooks.
-   `crm` / `helpdesk`: Specific connectors.

## 4. Database Schema

The application uses Supabase (PostgreSQL). Key tables include:

### `users`
-   `id`: UUID (PK, links to `auth.users`)
-   `email`, `full_name`, `role` ('admin' | 'user')

### `calls`
-   `id`: UUID (PK)
-   `caller_number`, `recipient_number`
-   `transcript`: Full text of the conversation.
-   `summary`: AI-generated summary.
-   `sentiment`: 'positive', 'neutral', 'negative'.
-   `resolution_status`: 'pending', 'resolved', 'escalated', 'failed'.

### `integrations`
-   `id`: UUID (PK)
-   `type`: 'mcp', 'webhook', 'api', 'crm', 'helpdesk'.
-   `config`: JSONB configuration for the integration.
-   `status`: 'active', 'inactive', 'error'.

### `vapi_knowledge_bases` (Inferred)
-   `company_id`: Link to organization.
-   `vapi_kb_id`: ID from Vapi.
-   `name`, `status`.

## 5. API Reference

The application exposes a RESTful API for managing resources. All API endpoints (except webhooks) require authentication via Supabase Auth.

### 5.1 Authentication

All requests to protected endpoints must include a valid Supabase session cookie or Bearer token.

### 5.2 Calls

Manage call logs and history.

#### List Calls
`GET /api/calls`

**Query Parameters:**
- `page` (number, default: 1): Page number.
- `limit` (number, default: 10): Items per page.
- `resolution_status` (string): Filter by status ('pending', 'resolved', 'escalated', 'failed').
- `call_type` (string): Filter by type ('inbound', 'outbound').
- `priority` (string): Filter by priority ('low', 'medium', 'high', 'urgent').
- `search` (string): Search in caller number, transcript, or summary.

**Response:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "caller_number": "+1234567890",
      "transcript": "...",
      "resolution_status": "resolved",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Get Call Details
`GET /api/calls/[id]`

Returns the full details of a specific call, including transcript and metadata.

#### Create Call
`POST /api/calls`

**Body:**
```json
{
  "caller_number": "+1234567890",
  "recipient_number": "+0987654321",
  "call_type": "inbound"
}
```

### 5.3 Integrations

Manage external integrations (MCP, Webhooks, CRM).

#### List Integrations
`GET /api/integrations`

**Query Parameters:**
- `page`, `limit`
- `type` (string): 'mcp', 'webhook', 'api', 'crm', 'helpdesk'.
- `status` (string): 'active', 'inactive', 'error'.
- `search` (string): Search by name or endpoint URL.

**Response:**
```json
{
  "integrations": [
    {
      "id": "uuid",
      "name": "Order Status MCP",
      "type": "mcp",
      "endpoint_url": "https://mcp.example.com",
      "status": "active"
    }
  ],
  "pagination": { ... }
}
```

#### Create Integration
`POST /api/integrations`

**Body:**
```json
{
  "name": "My Integration",
  "type": "mcp",
  "endpoint_url": "https://api.example.com",
  "config": { "apiKey": "..." }
}
```

#### Sync Integration
`POST /api/integrations/[id]/sync`

Triggers a synchronization for the specified integration.

### 5.4 Voice Agents

Configure AI voice agents.

#### List Agents
`GET /api/voice-agents`

**Query Parameters:**
- `page`, `limit`
- `status` (string): 'active', 'inactive', 'training'.
- `search` (string): Search by name.

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Support Bot",
      "type": "voice",
      "language": "en-US",
      "status": "active"
    }
  ],
  "pagination": { ... }
}
```

#### Create Agent
`POST /api/voice-agents`

**Body:**
```json
{
  "name": "Sales Agent",
  "type": "voice",
  "voice_model": "eleven_turbo_v2",
  "personality": "Professional and helpful",
  "language": "en-US",
  "greeting_message": "Hello, how can I help you today?",
  "knowledge_base_id": "uuid-optional"
}
```

#### Update Agent
`PUT /api/voice-agents/[id]`

Updates the configuration of a specific voice agent.

### 5.5 Dashboard & Analytics

#### Get Metrics
`GET /api/dashboard/metrics`

Returns high-level statistics for the dashboard:
- Total calls
- Resolved calls
- Active calls
- Average duration

### 5.6 Billing

- `POST /api/billing/create-checkout-session`: Initiates a Stripe checkout session.
- `POST /api/billing/portal`: Redirects to the Stripe Customer Portal.
- `GET /api/billing/subscription`: Retrieves current subscription status.

### 5.7 Other Resources

The API also includes endpoints for managing:
- **Organizations**: `/api/organizations/*`
- **Team Members**: `/api/team-members/*`
- **Phone Numbers**: `/api/phone-numbers/*`
- **Email Accounts**: `/api/email-accounts/*`

### 5.8 Webhooks

Public endpoints for external services.

- `POST /api/webhooks/vapi`: Receives call status updates and transcriptions from Vapi.ai.
- `POST /api/webhooks/twilio`: Handles incoming call events from Twilio.
- `POST /api/webhooks/flutterwave`: Payment notifications.

## 6. Project Structure

```
core-comm/
├── app/
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API Routes
│   ├── auth/              # Auth pages
│   └── layout.tsx         # Root layout
├── components/            # React components (UI)
├── lib/
│   ├── vapi/              # Vapi AI SDK wrappers
│   ├── supabase/          # Database clients
│   └── auth.ts            # Auth utilities
├── supabase/
│   ├── migrations/        # DB Migrations
│   └── schema.sql         # Core schema
├── deployment/            # Deployment scripts & docs
└── public/                # Static assets
```

## 7. Setup & Configuration

### Environment Variables

Required variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Vapi AI
VAPI_API_KEY=...
VAPI_DEFAULT_MODEL=gpt-4o
VAPI_DEFAULT_VOICE_PROVIDER=elevenlabs

# Twilio (if used directly)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

### Installation

1.  Install dependencies: `npm install`
2.  Run development server: `npm run dev`
3.  Run tests: `npm test`
