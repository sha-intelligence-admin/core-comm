# Integrations Feature

## Overview
CoreComm integrates with external services to extend its capabilities, primarily for Knowledge Base (RAG) and Action Execution (MCP).

## Supported Integrations

### 1. Vapi (Voice AI)
- **Purpose**: Core voice orchestration engine.
- **Integration Type**: Webhook & API.
- **Key Features**: Phone number provisioning, assistant configuration.

### 2. Knowledge Base Sources
- **Purpose**: Provide context for the AI to answer questions.
- **Types**:
  - **Text/PDF Uploads**: Stored in Supabase Storage, vectorized for search.
  - **Web Scraping**: Crawl company website for info.
  - **Notion/Google Drive**: (Planned) Connect to external docs.

### 3. MCP (Model Context Protocol) Servers
- **Purpose**: Execute actions (e.g., "Check order status").
- **Mechanism**: CoreComm acts as an MCP Client, connecting to user-defined MCP Servers.

## Technical Implementation

### Database Tables
- `integrations`: Stores credentials/config for connected services.
- `knowledge_base_documents`: Metadata for RAG sources.

### API Endpoints
- `/api/integrations/vapi/sync`: Sync assistants/numbers.
- `/api/integrations/kb/upload`: Handle document ingestion.

## References
- [PLAN_KB_INTEGRATIONS.md](../../PLAN_KB_INTEGRATIONS.md)
- [VAPI_WEBHOOK_SETUP.md](../../VAPI_WEBHOOK_SETUP.md)
