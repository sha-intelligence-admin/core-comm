-- Migration: Add Vapi Integration Tables
-- Description: Creates tables for managing Vapi voice assistants, knowledge bases, files, and phone numbers

-- =====================================================
-- 1. VAPI ASSISTANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vapi_assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  vapi_assistant_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  first_message TEXT NOT NULL,
  model_config JSONB DEFAULT '{}'::jsonb,
  voice_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vapi_assistants_company_id ON vapi_assistants(company_id);
CREATE INDEX idx_vapi_assistants_vapi_id ON vapi_assistants(vapi_assistant_id);
CREATE INDEX idx_vapi_assistants_active ON vapi_assistants(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER update_vapi_assistants_updated_at
  BEFORE UPDATE ON vapi_assistants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. VAPI KNOWLEDGE BASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vapi_knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  vapi_kb_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  provider TEXT DEFAULT 'google',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vapi_kb_company_id ON vapi_knowledge_bases(company_id);
CREATE INDEX idx_vapi_kb_vapi_id ON vapi_knowledge_bases(vapi_kb_id);

-- Updated_at trigger
CREATE TRIGGER update_vapi_knowledge_bases_updated_at
  BEFORE UPDATE ON vapi_knowledge_bases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. VAPI KNOWLEDGE BASE FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vapi_kb_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES vapi_knowledge_bases(id) ON DELETE CASCADE,
  vapi_file_id TEXT UNIQUE NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_url TEXT,
  parsing_status TEXT DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vapi_kb_files_kb_id ON vapi_kb_files(knowledge_base_id);
CREATE INDEX idx_vapi_kb_files_vapi_id ON vapi_kb_files(vapi_file_id);
CREATE INDEX idx_vapi_kb_files_status ON vapi_kb_files(parsing_status);

-- =====================================================
-- 4. VAPI PHONE NUMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vapi_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  vapi_phone_id TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  assistant_id UUID REFERENCES vapi_assistants(id) ON DELETE SET NULL,
  provider TEXT DEFAULT 'vapi' CHECK (provider IN ('vapi', 'twilio', 'vonage', 'telnyx', 'byo')),
  country_code TEXT DEFAULT 'US',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vapi_phones_company_id ON vapi_phone_numbers(company_id);
CREATE INDEX idx_vapi_phones_vapi_id ON vapi_phone_numbers(vapi_phone_id);
CREATE INDEX idx_vapi_phones_assistant ON vapi_phone_numbers(assistant_id);
CREATE INDEX idx_vapi_phones_active ON vapi_phone_numbers(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER update_vapi_phone_numbers_updated_at
  BEFORE UPDATE ON vapi_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. UPDATE CALLS TABLE FOR VAPI INTEGRATION
-- =====================================================
ALTER TABLE calls ADD COLUMN IF NOT EXISTS vapi_call_id TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS vapi_assistant_id TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cost_breakdown JSONB DEFAULT '{}'::jsonb;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS ended_reason TEXT;

-- Add index for Vapi call lookups
CREATE INDEX IF NOT EXISTS idx_calls_vapi_call_id ON calls(vapi_call_id);
CREATE INDEX IF NOT EXISTS idx_calls_vapi_assistant_id ON calls(vapi_assistant_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all Vapi tables
ALTER TABLE vapi_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vapi_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vapi_kb_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE vapi_phone_numbers ENABLE ROW LEVEL SECURITY;

-- Vapi Assistants Policies
CREATE POLICY "Users can view their company's assistants"
  ON vapi_assistants FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage assistants"
  ON vapi_assistants FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Knowledge Bases Policies
CREATE POLICY "Users can view their company's knowledge bases"
  ON vapi_knowledge_bases FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage knowledge bases"
  ON vapi_knowledge_bases FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Knowledge Base Files Policies
CREATE POLICY "Users can view files in their company's knowledge bases"
  ON vapi_kb_files FOR SELECT
  USING (
    knowledge_base_id IN (
      SELECT id FROM vapi_knowledge_bases
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage knowledge base files"
  ON vapi_kb_files FOR ALL
  USING (
    knowledge_base_id IN (
      SELECT id FROM vapi_knowledge_bases
      WHERE company_id IN (
        SELECT company_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Phone Numbers Policies
CREATE POLICY "Users can view their company's phone numbers"
  ON vapi_phone_numbers FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage phone numbers"
  ON vapi_phone_numbers FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get company ID from phone number (for webhook)
CREATE OR REPLACE FUNCTION get_company_id_from_vapi_phone(p_vapi_phone_id TEXT)
RETURNS UUID AS $$
  SELECT company_id FROM vapi_phone_numbers
  WHERE vapi_phone_id = p_vapi_phone_id AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to get assistant by phone number
CREATE OR REPLACE FUNCTION get_assistant_by_phone_number(p_phone_number TEXT)
RETURNS TABLE (
  assistant_id UUID,
  vapi_assistant_id TEXT,
  system_prompt TEXT,
  first_message TEXT,
  model_config JSONB,
  voice_config JSONB
) AS $$
  SELECT
    a.id,
    a.vapi_assistant_id,
    a.system_prompt,
    a.first_message,
    a.model_config,
    a.voice_config
  FROM vapi_assistants a
  INNER JOIN vapi_phone_numbers p ON p.assistant_id = a.id
  WHERE p.phone_number = p_phone_number
    AND p.is_active = true
    AND a.is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE vapi_assistants IS 'Stores Vapi voice assistant configurations for each company';
COMMENT ON TABLE vapi_knowledge_bases IS 'Manages knowledge bases that assistants use to answer questions';
COMMENT ON TABLE vapi_kb_files IS 'Tracks uploaded files within knowledge bases';
COMMENT ON TABLE vapi_phone_numbers IS 'Maps phone numbers to assistants and companies';

COMMENT ON COLUMN vapi_assistants.model_config IS 'JSONB: {provider, model, temperature, maxTokens, knowledgeBaseId}';
COMMENT ON COLUMN vapi_assistants.voice_config IS 'JSONB: {provider, voiceId, speed, stability}';
COMMENT ON COLUMN calls.cost_breakdown IS 'JSONB: {transcription, llm, tts, vapi, total}';
