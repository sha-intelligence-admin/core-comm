-- Create messaging_channels table
CREATE TABLE IF NOT EXISTS public.messaging_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel_name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('whatsapp', 'telegram', 'messenger', 'slack', 'discord', 'sms', 'webchat')),
    provider VARCHAR(50) NOT NULL DEFAULT 'twilio',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'error')),
    phone_number VARCHAR(20),
    api_key TEXT,
    webhook_url TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_received INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messaging_channels_user_id ON public.messaging_channels(user_id);

-- Create index on channel_type for filtering
CREATE INDEX IF NOT EXISTS idx_messaging_channels_type ON public.messaging_channels(channel_type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_messaging_channels_status ON public.messaging_channels(status);

-- Enable Row Level Security
ALTER TABLE public.messaging_channels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own messaging channels"
    ON public.messaging_channels
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messaging channels"
    ON public.messaging_channels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messaging channels"
    ON public.messaging_channels
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messaging channels"
    ON public.messaging_channels
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messaging_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_messaging_channels_updated_at
    BEFORE UPDATE ON public.messaging_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_messaging_channels_updated_at();
