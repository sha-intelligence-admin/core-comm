-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    
    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    
    -- Invitation Token
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Status Tracking
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
    
    -- Invitation Lifecycle
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES auth.users(id),
    
    -- Additional Data
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON organization_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON organization_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON organization_invitations(invited_by);

-- Enable Row Level Security
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view invitations"
    ON organization_invitations FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM organization_memberships 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can create invitations"
    ON organization_invitations FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT company_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Organization admins can update invitations"
    ON organization_invitations FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM organization_memberships 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Invited users can view their invitations"
    ON organization_invitations FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_organization_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_organization_invitations_updated_at
    BEFORE UPDATE ON organization_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_invitations_updated_at();

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE organization_invitations
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE organization_invitations IS 'Manages organization invitations and access tokens';
