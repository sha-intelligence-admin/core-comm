#!/usr/bin/env node

/**
 * Script to run database migrations using Supabase SQL Editor
 * This script provides instructions and verifies the migration
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const supabaseUrl = 'https://aozblceidxpxsovfbmyn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvemJsY2VpZHhweHNvdmZibXluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTYzOCwiZXhwIjoyMDcwNjMxNjM4fQ.Dktt2uOW46i4Fhkk5693r2KEmGbUeSknGemS5vI9mME';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigrationStatus() {
  console.log('🔍 Checking database migration status...\n');

  try {
    // Try to query the users table with new columns
    const { data, error } = await supabase
      .from('users')
      .select('id, email, onboarding_completed, metadata, created_at')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Migration NOT applied - columns do not exist');
        console.log(`   Error: ${error.message}\n`);
        return false;
      }
      console.log('⚠️  Warning:', error.message);
      return false;
    }

    console.log('✅ Migration appears to be applied!');
    console.log(`   Found ${data.length} user record(s)`);

    if (data.length > 0) {
      const user = data[0];
      console.log('\n📊 Sample user data:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Onboarding Completed: ${user.onboarding_completed ?? 'not set'}`);
      console.log(`   - Metadata: ${user.metadata ? 'exists' : 'null'}`);
    }

    return true;

  } catch (error) {
    console.log('❌ Error checking status:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Migration Tool\n');
  console.log('─'.repeat(60));

  const migrationApplied = await checkMigrationStatus();

  if (migrationApplied) {
    console.log('\n🎉 Success! The migration has already been applied.');
    console.log('   Your database is up to date.\n');
    return;
  }

  console.log('\n📋 Migration needs to be applied manually.\n');
  console.log('Please follow these steps:\n');

  console.log('1️⃣  Go to Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/aozblceidxpxsovfbmyn/sql/new\n');

  console.log('2️⃣  Copy and paste this SQL:\n');
  console.log('─'.repeat(60));

  const migrationPath = join(__dirname, '../supabase/migrations/20251103000000_add_user_fields.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf8');
  console.log(migrationSQL);

  console.log('─'.repeat(60));
  console.log('\n3️⃣  Click "Run" button\n');
  console.log('4️⃣  Verify by running this script again:\n');
  console.log('   node scripts/run-migration.mjs\n');
}

main().catch(console.error);
