import crypto from 'crypto';

/**
 * Normalizes the signature header to extract the hex digest.
 * Handles both raw hex strings and "sha256=<hex>" format.
 */
function normalizeSignature(signatureHeader: string): string {
  const trimmed = signatureHeader.trim();
  // Accept either "<hex>" or "sha256=<hex>" formats
  const parts = trimmed.split('=');
  if (parts.length === 2 && parts[0].toLowerCase() === 'sha256') {
    return parts[1].trim();
  }
  return trimmed;
}

/**
 * Verifies the cryptographic signature of a Vapi webhook request.
 * Uses HMAC-SHA256 and constant-time comparison to prevent timing attacks.
 * 
 * @param rawBody - The raw string body of the request
 * @param signatureHeader - The 'x-vapi-signature' header value
 * @param secret - The Vapi webhook secret from environment variables
 * @returns true if signature is valid, false otherwise
 */
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
