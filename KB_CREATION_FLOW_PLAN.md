# Knowledge Base Creation Flow Plan

This plan outlines the implementation of a dual-path Knowledge Base system: **BYOK** (Bring Your Own Knowledge Base) and **Managed**.

## 1. Database Schema

We need to formalize the KB records as specified. We will perform a migration to update the `knowledge_bases` (or `vapi_knowledge_bases`) table.

### Table: `knowledge_bases`
This table acts as the registry for both BYOK and Managed KBs.

```sql
create type kb_type as enum ('BYOK', 'MANAGED');
create type kb_status as enum ('READY', 'IN_PROGRESS', 'FAILED', 'VALIDATING');
create type kb_provider as enum ('qdrant', 'pinecone', 'weaviate', 'elastic', 'google_vertex', 'openai', 'native');

create table knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references company(id) not null,
  
  -- Core Metadata
  name text not null,
  type kb_type not null,
  provider kb_provider not null,
  status kb_status default 'IN_PROGRESS',
  
  -- Managed Specific
  domain text,
  languages text[], -- e.g. ['en', 'es']
  
  -- Configuration & Connections
  -- For BYOK: connection_ref holds encrypted credentials reference or config
  -- For Managed: index_config holds internal vector store details
  config jsonb default '{}'::jsonb, 
  
  -- Vapi Integration
  vapi_id text, -- ID of the tool or KB in Vapi
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Table: `knowledge_base_sources` (Managed Only)
Tracks the files, URLs, or text chunks ingested.

```sql
create type source_type as enum ('file', 'url', 'text');
create type ingestion_status as enum ('pending', 'processing', 'completed', 'failed');

create table knowledge_base_sources (
  id uuid primary key default gen_random_uuid(),
  kb_id uuid references knowledge_bases(id) not null,
  
  type source_type not null,
  content text, -- URL or raw text or file path
  metadata jsonb, -- e.g. filename, size
  
  status ingestion_status default 'pending',
  chunk_count int default 0,
  error_message text,
  
  created_at timestamptz default now()
);
```

## 2. API Routes Structure

We will separate the creation logic into distinct routes to handle the granular steps.

### A. Creation & Validation
*   `POST /api/knowledge-bases`
    *   **Step A1/A3**: Creates the Initial Record.
    *   **Step A2**: If `validate: true` is passed, triggers `validateConnection(provider, credentials)`.
    *   **Step B1**: Creates the Managed Record.

### B. Setup & Ingestion
*   `POST /api/knowledge-bases/[id]/ingest` (Managed Only)
    *   **Step B2/B3**: Accepts files/URLs.
    *   **Action**: 
        1. Creates `knowledge_base_sources` records.
        2. Triggers async `IngestionPipeline`.

### C. Connection Validation (Standalone)
*   `POST /api/knowledge-bases/validate`
    *   **Step A2**: Check connectivity for BYOK providers before creating a record.

## 3. Frontend Implementation (The Dashboard)

We will create a multi-step wizard experience at `/dashboard/knowledge-bases/create`.

### Page Structure: `app/dashboard/knowledge-bases/create/page.tsx`
Using a client-side state machine (e.g., `useState` or `useReducer`) to manage the "Step 0" to "Step 7" flow.

#### Component: `StrategySelection` (Step 0)
*   Two large Cards: "Bring Your Own (BYOK)" vs "Managed (Hosted)".
*   Selection updates state `strategy: 'BYOK' | 'MANAGED'`.

#### Component: `ByokConfigForm` (Path A)
*   **Step A1 (Provider Selection)**: Dropdown (Qdrant, Pinecone, etc.).
*   **Step A1-A2 (Credentials)**:
    *   Fields depend on provider (e.g., `apiKey`, `url`, `collectionName`).
    *   **"Test Connection" Button**: Calls `POST /api/knowledge-bases/validate`.
    *   Success State: Shows green checkmark "Connection Valid".
*   **Step A3 (Submission)**:
    *   "Create Knowledge Base" button calls `POST /api/knowledge-bases`.
    *   Redirects to KB Detail page upon success.

#### Component: `ManagedIngestionForm` (Path B)
*   **Step B1 (Metadata)**: Input for Name, Domain (optional), Language dropdown.
*   **Step B2 (Source Selection)**:
    *   **Tabs**: `File Upload` | `Web URL` | `Raw Text`.
    *   **File Upload**: Drag & drop zone (PDF, DOCX, TXT). Auto-uploads to temporary bucket.
    *   **URL Input**: Add multiple URLs.
*   **Step B3-B4 (Processing UI)**:
    *   "Start Ingestion" button calls `POST /api/knowledge-bases/[id]/ingest`.
    *   **Real-time List**: Shows sources with status badges (Pending → Processing → Ready).
    *   Uses polling or Supabase Realtime to update status.

### Status & Detail View: `app/dashboard/knowledge-bases/[id]/page.tsx`
*   Displays the JSON object from **Step 7** (Status, Provider Type, Adapter Config).
*   For Managed: Shows list of sources and their sync status.
*   "Test Playground": A simple chat input to test the `search_knowledge_base` Vapi tool behavior directly.

## 4. Backend Logic (Service Layer)

### `lib/knowledge-base/adapter.interface.ts`
```typescript
interface KbAdapter {
  validate(config: any): Promise<boolean>;
  query(query: string, config: any): Promise<string>; // For Vapi Tool
  ingest?(source: KbSource): Promise<void>; // Managed Only
}
```

### Path A: BYOK Adapter (`lib/knowledge-base/adapters/byok.ts`)
*   **Implementations**: `QdrantAdapter`, `PineconeAdapter`, etc.
*   **Step A4 (Bind Adapter)**: The "Binding" is effectively storing the valid config in the DB. The runtime "Binding" happens when we register the tool with Vapi.

### Path B: Managed Pipeline (`lib/knowledge-base/pipelines/ingest.ts`)
*   **Components**:
    *   `Parser`: `pdf-parse`, `cheerio` (for URLs).
    *   `Cleaner`: Regex/Text cleanup.
    *   `Chunker`: LangChain `RecursiveCharacterTextSplitter`.
    *   `Embedder`: OpenAI `text-embedding-3-small`.
    *   `VectorStore`: Supabase `pgvector` or `Qdrant`.
*   **Step B4 (Tracking)**: Updates `knowledge_base_sources` and `knowledge_bases` status columns.

## 4. Vapi Integration (The Runtime)

### The Tool Proxy (Step 5/7)
For both BYOK and Managed, Vapi will communicate via a **Tool**.

*   **Tool Name**: `search_knowledge_base`
*   **Webhook**: `/api/webhooks/vapi/kb-search`
*   **Payload**: `query`, `kb_id` (passed via Vapi server instructions or tool properties).

**Flow**:
1.  Vapi calls Webhook.
2.  Webhook loads KB record from `knowledge_bases`.
3.  If `BYOK`:
    *   Decrypt credentials.
    *   Call `ByokAdapter.query()`.
4.  If `MANAGED`:
    *   Call `ManagedAdapter.query()` (Query internal vector store).
5.  Return `{ result: "..." }`.

## 6. Implementation Steps Order

1.  **Migration**: Create tables (`knowledge_bases`, `knowledge_base_sources`).
2.  **Types**: Define Interfaces for Adapters.
3.  **Core Service**: `createKnowledgeBase`, `validateConnection`.
4.  **API Routes**: Implementation of the routes.
5.  **Adapters**: Basic implementation for one BYOK (e.g., Qdrant/OpenAI) and Managed (Simple Text).
6.  **Frontend**: Build the Wizard Page and Components.

This approach strictly adheres to the "Path A / Path B" flow requested.
