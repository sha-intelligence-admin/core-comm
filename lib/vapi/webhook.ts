import crypto from 'crypto';

function normalizeSignature(signatureHeader: string): string {
  const trimmed = signatureHeader.trim();
  // Accept either "<hex>" or "sha256=<hex>" formats
  const parts = trimmed.split('=');
  if (parts.length === 2 && parts[0].toLowerCase() === 'sha256') {
    return parts[1].trim();
  }
  return trimmed;
}

export function verifyVapiWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  if (!rawBody || !signatureHeader || !secret) return false;

  const signatureHex = normalizeSignature(signatureHeader);

  let expectedHex: string;
  try {
    expectedHex = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('hex');
  } catch {
    return false;
  }

  // Constant-time compare
  try {
    const provided = Buffer.from(signatureHex, 'hex');
    const expected = Buffer.from(expectedHex, 'hex');
    if (provided.length !== expected.length) return false;
    return crypto.timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}
