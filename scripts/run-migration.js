#!/usr/bin/env node

/**
 * Script to run database migrations
 * Usage: node scripts/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251103000000_add_user_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file:', migrationPath);
    console.log('📝 SQL to execute:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        // Try alternative approach - direct query
        console.log('   Trying alternative approach...');

        try {
          // For ALTER TABLE and CREATE INDEX, we need to use the connection pool
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql: statement })
          });

          if (!response.ok) {
            console.log(`   ⚠️  Statement might have already been applied or needs manual execution`);
            console.log(`   Statement: ${statement.substring(0, 50)}...`);
          } else {
            console.log(`   ✅ Statement ${i + 1} executed`);
          }
        } catch (altError) {
          console.log(`   ⚠️  Could not execute via API: ${altError.message}`);
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n🔍 Verifying migration...\n');

    // Verify the columns were added
    const { data: tableInfo, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Users table is accessible');

      // Try to query with the new columns
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id, email, onboarding_completed, metadata')
        .limit(1);

      if (testError) {
        console.log('⚠️  New columns might not be visible yet:', testError.message);
        console.log('\n📋 Manual migration required. Please run this SQL in Supabase Dashboard:');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
      } else {
        console.log('✅ New columns (onboarding_completed, metadata) are accessible!');
        console.log('\n🎉 Migration completed successfully!');
      }
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n📋 Please run the migration manually:');
    console.error('1. Go to https://supabase.com/dashboard/project/aozblceidxpxsovfbmyn/editor');
    console.error('2. Click "SQL Editor"');
    console.error('3. Paste and run the SQL from: supabase/migrations/20251103000000_add_user_fields.sql');
    process.exit(1);
  }
}

// Run the migration
runMigration();
