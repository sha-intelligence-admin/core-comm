-- Create voice_agents table
CREATE TABLE IF NOT EXISTS public.voice_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    voice_model VARCHAR(100) NOT NULL DEFAULT 'en-US-neural',
    personality TEXT,
    language VARCHAR(10) NOT NULL DEFAULT 'en-US',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training', 'error')),
    greeting_message TEXT,
    knowledge_base_id UUID,
    config JSONB DEFAULT '{}'::jsonb,
    total_calls INTEGER DEFAULT 0,
    total_minutes DECIMAL(10, 2) DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_voice_agents_user_id ON public.voice_agents(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_voice_agents_status ON public.voice_agents(status);

-- Enable Row Level Security
ALTER TABLE public.voice_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own voice agents"
    ON public.voice_agents
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice agents"
    ON public.voice_agents
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice agents"
    ON public.voice_agents
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice agents"
    ON public.voice_agents
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_voice_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_voice_agents_updated_at
    BEFORE UPDATE ON public.voice_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_voice_agents_updated_at();
