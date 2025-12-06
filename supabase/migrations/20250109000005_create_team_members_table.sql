-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- admin, manager, agent, viewer, developer
    department VARCHAR(100), -- support, sales, engineering, billing, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited', 'suspended')),
    
    -- Contact Information
    phone_number VARCHAR(50),
    avatar_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    
    -- Permissions and Access
    permissions JSONB DEFAULT '{}'::jsonb, -- Fine-grained permissions
    can_access_analytics BOOLEAN DEFAULT false,
    can_manage_integrations BOOLEAN DEFAULT false,
    can_manage_team BOOLEAN DEFAULT false,
    can_manage_agents BOOLEAN DEFAULT false,
    can_view_calls BOOLEAN DEFAULT true,
    can_view_messages BOOLEAN DEFAULT true,
    can_view_emails BOOLEAN DEFAULT true,
    
    -- Activity Tracking
    last_login_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    invitation_sent_at TIMESTAMPTZ,
    invitation_accepted_at TIMESTAMPTZ,
    
    -- Performance Metrics
    total_calls_handled INTEGER DEFAULT 0,
    total_messages_handled INTEGER DEFAULT 0,
    total_emails_handled INTEGER DEFAULT 0,
    avg_response_time NUMERIC(10, 2) DEFAULT 0, -- in seconds
    customer_satisfaction_score NUMERIC(3, 2) DEFAULT 0, -- 0.00 to 5.00
    
    -- Additional Settings
    notes TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure email uniqueness per organization/user
    UNIQUE(user_id, email)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own team members"
    ON team_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
    ON team_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
    ON team_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
    ON team_members FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_team_members_updated_at();

-- Add comments for documentation
COMMENT ON TABLE team_members IS 'Stores team member information, roles, permissions, and performance metrics';
COMMENT ON COLUMN team_members.role IS 'Team member role: admin, manager, agent, viewer, developer';
COMMENT ON COLUMN team_members.status IS 'Member status: active, inactive, invited, suspended';
COMMENT ON COLUMN team_members.permissions IS 'Fine-grained JSON permissions for custom access control';
COMMENT ON COLUMN team_members.config IS 'Additional JSON configuration for member-specific settings';
