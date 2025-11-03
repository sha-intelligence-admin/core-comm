import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks = {
    database: 'unknown',
    vapi: 'unknown',
    analytics: 'unknown'
  }

  try {
    // Check database
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1)
    checks.database = dbError ? 'error' : 'healthy'
  } catch {
    checks.database = 'error'
  }

  // Check Vapi (if API key exists)
  try {
    checks.vapi = process.env.VAPI_API_KEY ? 'healthy' : 'not_configured'
  } catch {
    checks.vapi = 'error'
  }

  // Analytics - simulating for now
  checks.analytics = 'degraded'

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks
  })
}
