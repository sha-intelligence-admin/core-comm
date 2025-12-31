import crypto from 'crypto';
import { verifyVapiWebhookSignature } from '@/lib/vapi/webhook';

describe('verifyVapiWebhookSignature', () => {
  it('returns true for a valid sha256 hex signature', () => {
    const secret = 'test_secret';
    const raw = JSON.stringify({ hello: 'world' });

    const sig = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');

    expect(verifyVapiWebhookSignature(raw, sig, secret)).toBe(true);
  });

  it('accepts signature header in sha256=<hex> form', () => {
    const secret = 'test_secret';
    const raw = JSON.stringify({ type: 'assistant-request' });

    const sig = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');

    expect(verifyVapiWebhookSignature(raw, `sha256=${sig}`, secret)).toBe(true);
  });

  it('returns false for an invalid signature', () => {
    const secret = 'test_secret';
    const raw = JSON.stringify({ hello: 'world' });

    expect(verifyVapiWebhookSignature(raw, 'deadbeef', secret)).toBe(false);
  });
});
