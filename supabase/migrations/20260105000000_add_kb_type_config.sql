-- KB Creation Flow Schema Updates

-- ENUMS
DO $$ BEGIN
    CREATE TYPE kb_type AS ENUM ('BYOK', 'MANAGED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kb_status AS ENUM ('READY', 'IN_PROGRESS', 'FAILED', 'VALIDATING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kb_provider AS ENUM ('qdrant', 'pinecone', 'weaviate', 'elastic', 'google_vertex', 'openai', 'native');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE source_type AS ENUM ('file', 'url', 'text');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ingestion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TABLE: knowledge_bases
-- Replaces or extends existing concepts of functionality
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES company(id) NOT NULL,
  
  -- Core Metadata
  name text NOT NULL,
  type kb_type NOT NULL,
  provider kb_provider NOT NULL,
  status kb_status DEFAULT 'IN_PROGRESS',
  
  -- Managed Specific
  domain text,
  languages text[], -- e.g. ['en', 'es']
  
  -- Configuration & Connections
  config jsonb DEFAULT '{}'::jsonb, 
  
  -- Vapi Integration
  vapi_id text, -- ID of the tool or KB in Vapi
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for knowledge_bases
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view KBs for their company"
    ON knowledge_bases FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE auth.uid() = id));

CREATE POLICY "Admins can manage KBs"
    ON knowledge_bases FOR ALL
    USING (company_id IN (SELECT company_id FROM users WHERE auth.uid() = id AND role = 'admin'));


-- TABLE: knowledge_base_sources (Managed Only)
CREATE TABLE IF NOT EXISTS knowledge_base_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kb_id uuid REFERENCES knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  
  type source_type NOT NULL,
  content text, -- URL or raw text or file path
  metadata jsonb, -- e.g. filename, size
  
  status ingestion_status DEFAULT 'pending',
  chunk_count int DEFAULT 0,
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- RLS for knowledge_base_sources
ALTER TABLE knowledge_base_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view KB sources for their company"
    ON knowledge_base_sources FOR SELECT
    USING (
        kb_id IN (
            SELECT id FROM knowledge_bases 
            WHERE company_id IN (SELECT company_id FROM users WHERE auth.uid() = id)
        )
    );

CREATE POLICY "Admins can manage KB sources"
    ON knowledge_base_sources FOR ALL
    USING (
        kb_id IN (
            SELECT id FROM knowledge_bases 
            WHERE company_id IN (SELECT company_id FROM users WHERE auth.uid() = id AND role = 'admin')
        )
    );
