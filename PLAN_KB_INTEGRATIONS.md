# Plan: Connect Knowledge Base & Integrations to Backend/Vapi

This plan outlines the steps to fully implement the backend logic for Knowledge Bases (KB) and Integrations, ensuring they sync with Vapi AI and the database, and that the UI modals function correctly.

## Phase 1: Knowledge Base (KB) Implementation

The goal is to make the KB system functional by connecting it to Vapi's API for file storage and vectorization.

### 1.1. Database Schema Updates
*   **Verify/Update `vapi_knowledge_bases`**: Ensure columns exist for `vapi_id` (remote ID), `status` (synced/processing), and `provider` (e.g., 'vapi-doc').
*   **Verify/Update `vapi_kb_files`**: Ensure columns for `vapi_file_id`, `url`, `status`, and `size`.

### 1.2. Vapi Client Implementation (`lib/vapi/`)
*   **Update `knowledge-bases.ts`**:
    *   Implement `createVapiFile(file: File)`: Uploads file to Vapi.
    *   Implement `createVapiKnowledgeBase(fileIds: string[])`: Creates a KB on Vapi with the uploaded files.
    *   Implement `deleteVapiFile(fileId: string)`: Removes file from Vapi.
*   **Sync Logic**: Ensure that when a user creates a KB or uploads a file, the action is performed on Vapi *first*, then recorded in Supabase.

### 1.3. API Routes (`app/api/vapi/knowledge-bases/`)
*   **`POST /route.ts` (Create KB)**:
    *   Accept `name`, `description`, and initial `files`.
    *   Call Vapi API to create the KB.
    *   Save result to Supabase.
*   **`POST /[id]/files/route.ts` (Upload File)**:
    *   Handle `multipart/form-data`.
    *   Upload file to Vapi.
    *   Update Vapi KB with new file.
    *   Insert record into `vapi_kb_files`.
*   **`DELETE /[id]/route.ts`**: Delete from Vapi and Supabase.

### 1.4. UI & Modals (`app/(dashboard)/knowledge-base/`)
*   **`CreateKnowledgeBaseModal`**:
    *   Ensure it captures Name, Description, and optionally initial files.
    *   Show loading state during the Vapi API call.
    *   Handle errors (e.g., "File too large").
*   **File Upload Component**:
    *   Implement drag-and-drop or file picker.
    *   Show progress indicators for upload -> processing.

---

## Phase 2: Integrations Implementation

The goal is to make the Integrations page functional, allowing users to connect external tools (CRMs, Webhooks) that actually trigger actions.

### 2.1. Database Schema
*   **`integrations` table**: Ensure it has `config` (JSONB) to store API keys/secrets securely (encrypted if possible) and `credentials` (JSONB).

### 2.2. Backend Logic (`lib/integrations/`)
*   **CRM Handlers**: Create a factory pattern for CRM integrations (e.g., HubSpot, Salesforce).
    *   `HubSpotIntegration`: Methods to `syncContacts`, `logCall`.
*   **Webhook Handlers**: Logic to dispatch events to user-configured webhooks.

### 2.3. API Routes (`app/api/integrations/`)
*   **`POST /route.ts`**:
    *   Validate specific config based on `type` (e.g., HubSpot requires OAuth token or API key).
    *   Test the connection (ping the external API) before saving.
*   **`POST /[id]/sync`**: Trigger a manual sync for a specific integration.

### 2.4. UI & Modals (`app/(dashboard)/integrations/`)
*   **`AddIntegrationModal`**:
    *   **Dynamic Forms**: Render different fields based on selected type (e.g., "API Key" for HubSpot, "URL" for Webhook).
    *   **Test Connection Button**: Allow users to verify credentials before saving.
*   **`IntegrationCard`**:
    *   Add "Sync Now" button functionality.
    *   Show real-time status (e.g., "Last synced 5 mins ago").

---

## Phase 3: Linking to Vapi Assistants

### 3.1. Assistant Configuration (Completed)
*   [x] Update `lib/vapi/assistants.ts` to include `knowledgeBaseId` when creating/updating an assistant.
*   [x] Allow users to select an active Integration (e.g., "Log calls to HubSpot") in the Assistant settings. (Note: UI for this is part of Assistant settings, backend support is ready via `IntegrationFactory`)

### 3.2. Server-Side Tool Execution (Completed)
*   [x] Update `app/api/webhooks/vapi/route.ts` to handle `function-call` events.
*   [x] Implement logic to look up active Integrations and route the request to the appropriate external tool (via `executeAction`).

### 3.3. Organization Creation Integration (Completed)
*   [x] **Onboarding Flow**: Integrate KB and Integration setup steps into the "Create Organization" or "Onboarding" wizard. (Updated `app/api/organizations/create/route.ts`)
*   [x] **Initialization**: Ensure necessary Vapi resources (like a default KB) are provisioned when a new organization is created. (Implemented default KB creation and linking)

## Execution Order (Completed)
1.  [x] **KB Backend**: Implement Vapi file upload & KB creation logic.
2.  [x] **KB UI**: Wire up the file upload and create modal.
3.  [x] **Integrations Backend**: Implement "Test Connection" logic.
4.  [x] **Integrations UI**: Build dynamic forms for adding integrations.
5.  [x] **Assistant Linking**: Link KB and Integrations to Vapi Assistants.
6.  [x] **Onboarding**: Automate setup during organization creation.
