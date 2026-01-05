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
 * GET /api/webhooks/twilio/sms
 * Health check endpoint for Twilio SMS webhook.
 * 
 * @returns Response with 200 OK
 */
export async function GET() {
  return new Response('OK', { status: 200 });
}

/**
 * POST /api/webhooks/twilio/sms
 * Handles incoming SMS messages from Twilio.
 * 
 * @param request - NextRequest object containing SMS data
 * @returns XML response with TwiML
 */
export async function POST(request: NextRequest) {
  const form = await (request as unknown as Request).formData();
  const params = toParams(form);

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get('x-twilio-signature');

  if (authToken && signature) {
    try {
      const isValid = twilio.validateRequest(authToken, signature, request.url, params);
      if (!isValid) {
        return xmlResponse('<Response><Message>Invalid signature.</Message></Response>', 401);
      }
    } catch {
      return xmlResponse('<Response><Message>Signature verification failed.</Message></Response>', 401);
    }
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('CoreComm received your message. SMS processing is not enabled yet.');

  return xmlResponse(twiml.toString());
}
