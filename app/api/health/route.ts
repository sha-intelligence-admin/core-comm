import { createSuccessResponse } from '@/lib/supabase/api'

export async function GET() {
  return createSuccessResponse({
    status: 'ok',
    message: 'CoreComm backend running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}
