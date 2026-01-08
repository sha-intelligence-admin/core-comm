# Plan: Flexible Knowledge Base Onboarding

This plan outlines the changes required to allow users to choose between a Managed Knowledge Base (provided by the platform) and a "Bring Your Own" (BYO) Knowledge Base during the organization creation flow.

## 1. User Flow & UX

The onboarding wizard will be updated to include a dedicated "Knowledge Base Setup" step.

### Step 1: Choose Strategy
The user is presented with two primary options:
1.  **Use Platform Knowledge Base (Managed)**
    *   *Description:* "We host and manage the vector database for you. Easiest to set up."
    *   *Action:* User selects this option.
2.  **Bring Your Own (BYO)**
    *   *Description:* "Connect your existing vector database (Qdrant, Pinecone, etc.). Best for advanced control."
    *   *Action:* User selects this option.

### Step 2: Configure Provider
Based on the strategy selected in Step 1:

**If Managed:**
*   **Select Provider:** Dropdown [Trieve (Default), OpenAI, Vapi-Doc].
*   **Upload Files:** Drag & drop interface to upload initial documents (PDF, TXT, DOCX).
*   **Action:** "Create & Sync"

**If BYO:**
*   **Select Provider:** Dropdown [Qdrant, Pinecone, Weaviate, Custom API].
*   **Enter Credentials:**
    *   *Qdrant:* URL, API Key, Collection Name.
    *   *Pinecone:* API Key, Environment, Index Name.
    *   *Custom:* Webhook URL, Auth Header.
*   **Action:** "Connect & Verify"

## 2. Database Schema Updates

We need to store the configuration details for the Knowledge Base.

### Update `vapi_knowledge_bases` table
Add columns to support BYO configurations:
*   `type`: `ENUM('managed', 'byo')` (Default: 'managed')
*   `config`: `JSONB` (Stores provider-specific settings like collection names, indexes, etc.)
*   `credentials`: `JSONB` (Encrypted storage for API keys/secrets - *Note: Consider security implications, might need a separate secure table or Vault*)

**Example `config` JSON for BYO (Qdrant):**
```json
{
  "url": "https://xyz.qdrant.io",
  "collection": "my-company-docs"
}
```

## 3. Backend Implementation

### 3.1. Update `lib/vapi/knowledge-bases.ts`
Refactor `createKnowledgeBase` to handle the new logic:

*   **Managed Flow:**
    *   Continue using `createVapiKnowledgeBase` (which calls Vapi API).
    *   Support passing the selected `provider` (currently hardcoded to 'trieve').
*   **BYO Flow:**
    *   **Do NOT** create a KB on Vapi side in the traditional sense.
    *   Instead, register a **Tool** on the Vapi Assistant that points to our proxy endpoint (or directly to the user's API if possible, but proxy is safer for secrets).
    *   Store the connection details in Supabase.

### 3.2. New Tool Proxy Service (`app/api/tools/kb-proxy/route.ts`)
If the user selects BYO, the Vapi Assistant needs a way to query it.
*   Create a generic "Knowledge Retrieval" tool definition for Vapi.
*   When Vapi calls this tool, our backend receives the request.
*   Our backend looks up the organization's BYO config (e.g., Qdrant credentials).
*   Our backend executes the query against the external vector DB.
*   Our backend returns the result to Vapi.

### 3.3. Update `app/api/organizations/create/route.ts`
*   Accept new payload structure:
    ```json
    {
      "knowledgeBase": {
        "strategy": "managed" | "byo",
        "provider": "trieve" | "qdrant" | ...,
        "files": [...], // if managed
        "config": { ... } // if byo
      }
    }
    ```
*   Branch logic:
    *   If `managed`: Call `createKnowledgeBase` (Vapi).
    *   If `byo`: Validate connection -> Store config -> Add "Retrieval Tool" to the Assistant configuration.

## 4. Implementation Steps

1.  **Schema Migration:** Add `type` and `config` columns to `vapi_knowledge_bases`.
2.  **Backend Logic:**
    *   Update `lib/vapi/knowledge-bases.ts` to support dynamic providers.
    *   Implement `lib/integrations/qdrant.ts` (and others) for the proxy service.
    *   Create the Tool Proxy API route.
3.  **API Route:** Update the organization creation endpoint to parse the new payload.
4.  **Frontend:** Build the UI components for the selection wizard (out of scope for this backend plan, but noted).

## 5. Example Payload for `POST /api/organizations/create`

**Managed:**
```json
{
  "companyName": "Acme Corp",
  "knowledgeBase": {
    "strategy": "managed",
    "provider": "trieve",
    "files": ["file_base64_..."]
  }
}
```

**BYO (Qdrant):**
```json
{
  "companyName": "Acme Corp",
  "knowledgeBase": {
    "strategy": "byo",
    "provider": "qdrant",
    "config": {
      "url": "https://...",
      "apiKey": "...",
      "collection": "docs"
    }
  }
}
```
