import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/api'

/**
 * ADMIN ONLY: Migration endpoint
 * Run migrations by calling: POST /api/admin/migrate
 *
 * This endpoint executes the pending migration to add user fields.
 * Delete this file after migration is complete for security.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database migration...')

    const supabase = createServiceRoleClient()

    // Execute each migration step
    const migrations = [
      {
        name: 'Add onboarding_completed column',
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false'
      },
      {
        name: 'Add metadata column',
        sql: "ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb"
      },
      {
        name: 'Create onboarding index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed)'
      }
    ]

    const results = []

    for (const migration of migrations) {
      console.log(`⏳ Executing: ${migration.name}...`)

      const { data, error } = await supabase.rpc('exec', {
        sql: migration.sql
      })

      if (error) {
        console.error(`❌ Error in ${migration.name}:`, error)
        results.push({
          migration: migration.name,
          status: 'error',
          error: error.message
        })
      } else {
        console.log(`✅ ${migration.name} completed`)
        results.push({
          migration: migration.name,
          status: 'success'
        })
      }
    }

    // Verify the migration
    console.log('🔍 Verifying migration...')

    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, onboarding_completed, metadata')
      .limit(1)

    if (verifyError) {
      return NextResponse.json({
        success: false,
        message: 'Migration may have issues',
        results,
        verification: {
          status: 'failed',
          error: verifyError.message
        }
      }, { status: 500 })
    }

    console.log('✅ Migration verified successfully!')

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results,
      verification: {
        status: 'success',
        message: 'New columns are accessible',
        sample: verifyData[0]
      }
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)

    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: {
        step1: 'Go to Supabase Dashboard SQL Editor',
        step2: 'Run the SQL from: supabase/migrations/20251103000000_add_user_fields.sql',
        url: 'https://supabase.com/dashboard/project/aozblceidxpxsovfbmyn/sql/new'
      }
    }, { status: 500 })
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, onboarding_completed, metadata')
      .limit(1)

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        return NextResponse.json({
          migrationApplied: false,
          message: 'Migration not yet applied',
          error: error.message
        })
      }

      return NextResponse.json({
        migrationApplied: false,
        message: 'Error checking migration status',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      migrationApplied: true,
      message: 'Migration has been applied',
      sample: data[0]
    })

  } catch (error) {
    return NextResponse.json({
      migrationApplied: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
