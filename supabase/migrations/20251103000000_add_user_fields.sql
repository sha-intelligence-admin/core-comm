-- Migration: Add missing fields to users table for onboarding
-- Date: 2025-11-03

-- Add onboarding_completed field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add metadata field for storing additional user/company data
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);

-- Comment for documentation
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed onboarding flow';
COMMENT ON COLUMN users.metadata IS 'JSONB field for storing temporary company data during onboarding';
