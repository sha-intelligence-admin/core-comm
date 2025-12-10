-- Update voice_agents table for organization support
BEGIN;

-- Add is_active flag used by application layer
ALTER TABLE public.voice_agents
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Ensure existing rows have is_active set to TRUE
UPDATE public.voice_agents
SET is_active = TRUE
WHERE is_active IS NULL;

COMMIT;
