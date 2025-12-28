-- Migration: Update Vapi Knowledge Base Schema
-- Description: Adds status column to vapi_knowledge_bases

ALTER TABLE vapi_knowledge_bases
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'synced' CHECK (status IN ('synced', 'processing', 'failed'));

-- Add comment to provider column to indicate expected values
COMMENT ON COLUMN vapi_knowledge_bases.provider IS 'Provider of the knowledge base (e.g., "vapi-doc", "google")';
