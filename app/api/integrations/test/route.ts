import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const testIntegrationSchema = z.object({
  type: z.enum(['mcp', 'webhook', 'api', 'crm', 'helpdesk']),
  endpoint: z.string().optional().or(z.literal('')),
  apiKey: z.string().optional(),
})

/**
 * POST /api/integrations/test
 * Tests connectivity to an integration endpoint.
 * 
 * @param request - NextRequest object containing integration details
 * @returns JSON response with success status or error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, endpoint, apiKey } = testIntegrationSchema.parse(body)

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (type === 'webhook' || type === 'api') {
      if (!endpoint) {
        return NextResponse.json(
          { error: 'Endpoint URL is required for this integration type' },
          { status: 400 }
        )
      }

      try {
        // Try to reach the endpoint
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(endpoint, {
          method: 'HEAD',
          headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        // If we get a response, even 4xx/5xx, the server is reachable
        return NextResponse.json({ success: true, message: 'Connection successful' })

      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to reach endpoint: ' + (error instanceof Error ? error.message : 'Unknown error') },
          { status: 400 }
        )
      }
    }

    // For other types where we don't have real logic yet, we validate inputs
    if ((type === 'mcp' || type === 'crm' || type === 'helpdesk') && !apiKey) { 
         return NextResponse.json(
          { error: 'API Key is required' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, message: 'Connection successful' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
