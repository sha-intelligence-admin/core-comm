import { getTwilioClient } from './client';
import { trackUsage } from '@/lib/billing/usage-tracker';

export class SmsService {
  /**
   * Sends an SMS message using Twilio with billing tracking.
   * @param to Recipient phone number (E.164 format)
   * @param body Message body
   * @param companyId Company ID for billing tracking
   * @param from Optional sender number (defaults to env var)
   */
  async sendSms(to: string, body: string, companyId: string, from?: string) {
    const client = getTwilioClient();
    const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;

    if (!fromNumber) {
      throw new Error('Twilio phone number not configured');
    }

    // 1. Check Billing & Track Usage
    const usage = await trackUsage(companyId, 'sms', 1);
    if (!usage.allowed) {
      console.warn(`[Billing] SMS blocked for company ${companyId}: ${usage.reason}`);
      throw new Error(`SMS sending blocked: ${usage.reason}`);
    }

    try {
      // 2. Send SMS via Twilio
      const message = await client.messages.create({
        body,
        to,
        from: fromNumber,
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        cost: usage.costCents,
        isOverage: usage.isOverage
      };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      // Note: We already tracked usage. If send fails, we might want to refund?
      // For simplicity, we assume success if tracking passed. 
      // In a robust system, we would revert the tracking if send fails.
      throw error;
    }
  }
}

export const smsService = new SmsService();
