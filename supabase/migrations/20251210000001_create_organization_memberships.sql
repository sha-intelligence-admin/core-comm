-- Create organization_memberships table for multi-organization support
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    
    -- Role & Status
    role VARCHAR(50) NOT NULL DEFAULT 'member' 
        CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Organization Preferences
    is_default BOOLEAN DEFAULT false,
    display_name VARCHAR(255),
    
    -- Tracking
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    total_sessions INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, company_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_company_id ON organization_memberships(company_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_role ON organization_memberships(role);
CREATE INDEX IF NOT EXISTS idx_org_memberships_status ON organization_memberships(status);

-- Ensure only one default organization per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_default_org_per_user 
    ON organization_memberships(user_id) 
    WHERE is_default = true;

-- Enable Row Level Security
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own memberships"
    ON organization_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memberships"
    ON organization_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memberships"
    ON organization_memberships FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Organization owners can manage memberships"
    ON organization_memberships FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_memberships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organization_memberships_updated_at
    BEFORE UPDATE ON organization_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_memberships_updated_at();

-- Add comments for documentation
COMMENT ON TABLE organization_memberships IS 'Manages many-to-many relationship between users and organizations with roles';
COMMENT ON COLUMN organization_memberships.role IS 'User role in organization: owner, admin, manager, member, viewer';
COMMENT ON COLUMN organization_memberships.is_default IS 'Indicates users primary/default organization';
