-- Create email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL, -- gmail, outlook, exchange, imap, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'error', 'pending')),
    
    -- SMTP Configuration
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    smtp_password TEXT, -- Encrypted in production
    smtp_use_tls BOOLEAN DEFAULT true,
    
    -- IMAP Configuration
    imap_host VARCHAR(255),
    imap_port INTEGER,
    imap_username VARCHAR(255),
    imap_password TEXT, -- Encrypted in production
    imap_use_tls BOOLEAN DEFAULT true,
    
    -- OAuth Configuration (for Gmail, Outlook, etc.)
    oauth_provider VARCHAR(50),
    oauth_access_token TEXT,
    oauth_refresh_token TEXT,
    oauth_token_expiry TIMESTAMPTZ,
    
    -- Additional settings
    signature TEXT,
    auto_reply_enabled BOOLEAN DEFAULT false,
    auto_reply_message TEXT,
    forward_to_email VARCHAR(255),
    config JSONB DEFAULT '{}'::jsonb,
    
    -- Metrics
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_received INTEGER DEFAULT 0,
    total_emails_replied INTEGER DEFAULT 0,
    avg_response_time NUMERIC(10, 2) DEFAULT 0, -- in seconds
    last_sync_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email_address ON email_accounts(email_address);
CREATE INDEX IF NOT EXISTS idx_email_accounts_status ON email_accounts(status);
CREATE INDEX IF NOT EXISTS idx_email_accounts_provider ON email_accounts(provider);

-- Enable Row Level Security
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own email accounts"
    ON email_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email accounts"
    ON email_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email accounts"
    ON email_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email accounts"
    ON email_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_email_accounts_updated_at();

-- Add comments for documentation
COMMENT ON TABLE email_accounts IS 'Stores email account configurations and metrics for AI-powered email management';
COMMENT ON COLUMN email_accounts.provider IS 'Email service provider: gmail, outlook, exchange, imap, etc.';
COMMENT ON COLUMN email_accounts.config IS 'Additional JSON configuration for provider-specific settings';
COMMENT ON COLUMN email_accounts.avg_response_time IS 'Average time to respond to emails in seconds';
