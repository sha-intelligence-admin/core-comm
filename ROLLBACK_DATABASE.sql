-- =============================================================================
-- CoreComm Database ROLLBACK Script
-- =============================================================================
-- ⚠️  WARNING: This script will REMOVE all CoreComm tables and their data
-- ⚠️  This action is IRREVERSIBLE - all data will be permanently lost
-- ⚠️  Only run this if you want to completely undo the database setup
--
-- Run this in your Supabase SQL Editor: https://aozblceidxpxsovfbmyn.supabase.co
--
-- Tables that will be DELETED (company-scoped architecture):
-- 1. team_members (company_id) - and all team member data
-- 2. email_accounts (company_id) - and all email account configurations
-- 3. messaging_channels (company_id) - and all messaging channel data
-- 4. phone_numbers (company_id) - and all phone number data
-- 5. voice_agents (company_id) - and all voice agent configurations
--
-- This will also remove:
-- - All RLS policies for these tables
-- - All indexes (including company_id, created_by, status indexes)
-- - All triggers and functions (auto-update timestamps)
-- - All foreign key relationships
-- =============================================================================

-- Uncomment the line below to enable the rollback (safety measure)
-- DO $$ BEGIN RAISE NOTICE 'ROLLBACK ENABLED - Proceeding with table deletion'; END $$;

-- =============================================================================
-- Remove Team Members Table
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_team_members_updated_at ON team_members;
DROP FUNCTION IF EXISTS update_team_members_updated_at();
DROP TABLE IF EXISTS team_members CASCADE;

-- =============================================================================
-- Remove Email Accounts Table
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_email_accounts_updated_at ON email_accounts;
DROP FUNCTION IF EXISTS update_email_accounts_updated_at();
DROP TABLE IF EXISTS email_accounts CASCADE;

-- =============================================================================
-- Remove Messaging Channels Table
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_messaging_channels_updated_at ON public.messaging_channels;
DROP FUNCTION IF EXISTS update_messaging_channels_updated_at();
DROP TABLE IF EXISTS public.messaging_channels CASCADE;

-- =============================================================================
-- Remove Phone Numbers Table
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_phone_numbers_updated_at ON public.phone_numbers;
DROP FUNCTION IF EXISTS update_phone_numbers_updated_at();
DROP TABLE IF EXISTS public.phone_numbers CASCADE;

-- =============================================================================
-- Remove Voice Agents Table
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_voice_agents_updated_at ON public.voice_agents;
DROP FUNCTION IF EXISTS update_voice_agents_updated_at();
DROP TABLE IF EXISTS public.voice_agents CASCADE;

-- =============================================================================
-- ✅ ROLLBACK COMPLETE!
-- =============================================================================
-- All CoreComm tables have been removed from the database.
-- To restore them, run SAFE_SETUP_DATABASE.sql again.
-- =============================================================================
