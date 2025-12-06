-- Create phone_numbers table
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    country_code VARCHAR(5) NOT NULL DEFAULT '+1',
    provider VARCHAR(50) NOT NULL DEFAULT 'twilio',
    number_type VARCHAR(20) NOT NULL DEFAULT 'voice' CHECK (number_type IN ('voice', 'sms', 'both')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    friendly_name VARCHAR(255),
    capabilities JSONB DEFAULT '{"voice": true, "sms": true, "mms": false}'::jsonb,
    assigned_to VARCHAR(100),
    monthly_cost DECIMAL(10, 2) DEFAULT 0,
    total_inbound_calls INTEGER DEFAULT 0,
    total_outbound_calls INTEGER DEFAULT 0,
    total_sms_sent INTEGER DEFAULT 0,
    total_sms_received INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on phone_number to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_phone_numbers_unique ON public.phone_numbers(phone_number);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON public.phone_numbers(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON public.phone_numbers(status);

-- Create index on provider for filtering
CREATE INDEX IF NOT EXISTS idx_phone_numbers_provider ON public.phone_numbers(provider);

-- Enable Row Level Security
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own phone numbers"
    ON public.phone_numbers
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone numbers"
    ON public.phone_numbers
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers"
    ON public.phone_numbers
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers"
    ON public.phone_numbers
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_phone_numbers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_phone_numbers_updated_at
    BEFORE UPDATE ON public.phone_numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_phone_numbers_updated_at();
