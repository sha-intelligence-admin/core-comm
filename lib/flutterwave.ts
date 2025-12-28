import axios from 'axios';

const FLW_BASE = 'https://api.flutterwave.com/v3';
const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;

if (!FLW_SECRET) {
  console.warn('FLUTTERWAVE_SECRET_KEY is not set. Flutterwave API calls will fail.');
}

export async function createPaymentLink(payload: Record<string, any>) {
  // Use /payments for standard payments (one-time or initial subscription payment)
  // For subscriptions, include 'payment_plan' in the payload.
  const url = `${FLW_BASE}/payments`;
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export async function createPlan(payload: Record<string, any>) {
  const url = `${FLW_BASE}/payment-plans`;
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export async function createSubscription(payload: Record<string, any>) {
  const url = `${FLW_BASE}/subscriptions`;
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export async function cancelSubscription(subscriptionId: string) {
  const url = `${FLW_BASE}/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`;
  const resp = await axios.post(url, {}, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export function verifyWebhookSignature(rawBody: string, signatureHeader?: string | null) {
  if (!FLW_SECRET) return false;
  if (!signatureHeader) return false;
  try {
    const crypto = require('crypto');
    const computed = crypto.createHmac('sha256', FLW_SECRET).update(rawBody).digest('hex');
    return computed === signatureHeader;
  } catch (e) {
    return false;
  }
}

export default {
  createPaymentLink,
  verifyWebhookSignature,
};
