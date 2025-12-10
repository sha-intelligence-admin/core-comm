-- Add columns to company table for organization creation tracking
ALTER TABLE company ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE company ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE company ADD COLUMN IF NOT EXISTS setup_steps_completed JSONB DEFAULT '{"basics": true}'::jsonb;

-- Add index for created_by
CREATE INDEX IF NOT EXISTS idx_company_created_by ON company(created_by);

-- Add comments
COMMENT ON COLUMN company.created_by IS 'User who created this organization';
COMMENT ON COLUMN company.onboarding_completed IS 'Whether organization setup is complete';
COMMENT ON COLUMN company.setup_steps_completed IS 'Tracks which setup steps have been completed';
