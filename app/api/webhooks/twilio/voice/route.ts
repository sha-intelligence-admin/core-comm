import { NextRequest } from 'next/server';
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toParams(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    out[key] = typeof value === 'string' ? value : String(value);
  }
  return out;
}

function xmlResponse(xml: string, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * GET /api/webhooks/twilio/voice
 * Health check endpoint for Twilio Voice webhook.
 * 
 * @returns Response with 200 OK
 */
export async function GET() {
  return new Response('OK', { status: 200 });
}

/**
 * POST /api/webhooks/twilio/voice
 * Handles incoming voice calls from Twilio.
 * 
 * @param request - NextRequest object containing call data
 * @returns XML response with TwiML
 */
export async function POST(request: NextRequest) {
  // Twilio sends application/x-www-form-urlencoded, which NextRequest exposes via formData().
  const form = await (request as unknown as Request).formData();
  const params = toParams(form);

  // Optional signature verification (recommended in production)
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get('x-twilio-signature');

  if (authToken && signature) {
    try {
      const isValid = twilio.validateRequest(authToken, signature, request.url, params);
      if (!isValid) {
        return xmlResponse('<Response><Say>Invalid signature.</Say><Hangup/></Response>', 401);
      }
    } catch {
      return xmlResponse('<Response><Say>Signature verification failed.</Say><Hangup/></Response>', 401);
    }
  }

  // Minimal safe behavior: acknowledge call and end.
  // (CoreComm’s primary call handling is via Vapi; this endpoint exists for Twilio webhook validation.)
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(
    { voice: 'alice' },
    'CoreComm has received your call. This number is configured, but voice bridging is not enabled yet.'
  );
  twiml.hangup();

  return xmlResponse(twiml.toString());
}
