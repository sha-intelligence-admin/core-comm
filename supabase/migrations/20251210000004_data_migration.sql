-- Data migration: Populate organization_memberships from existing users
-- This creates memberships for all users who have a company_id

INSERT INTO organization_memberships (user_id, company_id, role, is_default, joined_at)
SELECT 
    u.id as user_id,
    u.company_id,
    'owner' as role,
    true as is_default,
    u.created_at as joined_at
FROM users u
WHERE u.company_id IS NOT NULL
ON CONFLICT (user_id, company_id) DO NOTHING;

-- Update company.created_by for existing companies
UPDATE company c
SET created_by = (
    SELECT u.id 
    FROM users u 
    WHERE u.company_id = c.id 
    LIMIT 1
)
WHERE created_by IS NULL;

-- Mark existing companies as onboarding completed
UPDATE company
SET onboarding_completed = true,
    setup_steps_completed = '{
        "basics": true,
        "phone": true,
        "integration": true,
        "assistant": true,
        "goals": true
    }'::jsonb
WHERE onboarding_completed = false;

-- Add company_id to team_members if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'team_members' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE team_members ADD COLUMN company_id UUID REFERENCES company(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_team_members_company_id ON team_members(company_id);
    END IF;
END $$;

-- Populate team_members.company_id from users
UPDATE team_members tm
SET company_id = u.company_id
FROM users u
WHERE tm.user_id = u.id AND tm.company_id IS NULL;
