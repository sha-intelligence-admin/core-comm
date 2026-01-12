# Plan: Managed Knowledge Base - Embeddings & Indexing Upgrade

This plan outlines the steps to upgrade the "Managed" Knowledge Base from a simple keyword search (`ilike`) to a semantic search engine using **OpenAI Embeddings** and **Supabase pgvector**.

## 1. Architecture Overview

### Current State (MVP)
*   **Ingestion**: Files -> Text Extraction -> Stored in DB as one large text block.
*   **Search**: `ilike '%query%'`. Matches only exact words.
*   **Limitation**: Fails on synonyms (e.g., "billing" vs "payment") and unstructured questions.

### Target State (Semantic Search)
*   **Ingestion**: Files -> Text Extraction -> **Chunking** -> **Embedding (OpenAI)** -> Stored as Vectors.
*   **Search**: Query -> Embedded to Vector -> **Cosine Similarity Search** (pgvector).
*   **Benefit**: Understands context and meaning.

## 2. Infrastructure & Schema

We will utilize Supabase's built-in vector support.

### 2.1. Database Schema
We need a new table to store the "chunks" and their vector representations.

```sql
-- 1. Enable the extension
create extension if not exists vector;

-- 2. Create the embeddings table
create table kb_documents (
  id uuid primary key default gen_random_uuid(),
  kb_id uuid references knowledge_bases(id) on delete cascade not null,
  source_id uuid references knowledge_base_sources(id) on delete cascade not null,
  
  content text not null,                -- The text chunk
  embedding vector(1536),               -- OpenAI 'text-embedding-3-small' output
  metadata jsonb default '{}'::jsonb,   -- Page number, section, etc.
  
  created_at timestamptz default now()
);

-- 3. Create HNSW Index for fast querying
create index on kb_documents using hnsw (embedding vector_cosine_ops);
```

### 2.2. Dependencies
We need libraries to handle text splitting and API calls.
*   `langchain` (or `@langchain/textsplitters`): For intelligent text chunking.
*   `openai`: For generating embeddings.
*   `@supabase/supabase-js`: for vector operations.

## 3. Implementation Steps

### Phase 1: Ingestion Pipeline (The "Writer")

We need to create a `processSource` function in `KnowledgeBaseService` that runs after file upload.

1.  **Read Source**: Fetch the raw text from `knowledge_base_sources`.
2.  **Chunking**: Split text into ~1000 character chunks with 200 character overlap.
    *   *Why?* Vectors represent small ideas best. One vector for a whole book is blurry.
3.  **Embedding**: Send batches of chunks to OpenAI `embeddings` API.
4.  **Storage**: Insert rows into `kb_documents`.
5.  **Status Update**: Update `knowledge_base_sources.status` to `completed` (or back to `processing` during this flow).

### Phase 2: Search Adapter (The "Reader")

Update `lib/knowledge-base/adapters/managed/native.ts`.

1.  **Embed Query**: When `query(text)` is called, first call OpenAI to embed `text`.
2.  **Vector Search**: Execute a Remote Procedure Call (RPC) or direct SQL query to find closest vectors.
    ```sql
    select content, 1 - (embedding <=> query_embedding) as similarity
    from kb_documents
    where kb_id = $1
    order by embedding <=> query_embedding
    limit 5;
    ```
3.  **Context Assembly**: Join the top 5 text chunks into a single string to return to the AI Agent.

## 4. Work Breakdown

### Step 1: Migration
*   [x] Create migration file `supabase/migrations/20260108000000_add_vector_support.sql`.
*   [ ] Run migration against Supabase. (**User Action Required**)

### Step 2: Backend Logic
*   [x] Install dependencies: `npm install openai @langchain/textsplitters`.
*   [x] Implement `lib/ai/embeddings.ts` helper (generateEmbedding).
*   [x] Update `KnowledgeBaseService` to include `processSource(sourceId)`.
*   [x] Update `POST /ingest` route to trigger processing (async or sync).

### Step 3: Search Logic
*   [x] Update `NativeManagedAdapter` to use vector search.

## 5. Cost Implications
*   **OpenAI Embeddings**: Very cheap (`text-embedding-3-small` is ~$0.00002 / 1k tokens).
*   **Supabase**: `pgvector` adds to database size, but usually negligible for <1GB of text.
