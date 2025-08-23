import twilio from 'twilio';
import { CONFIG } from '../config/config.js';

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  static validateWebhookSignature(signature, body, url) {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    return twilio.validateRequest(authToken, signature, url, body);
  }

  createVoiceResponse() {
    return new twilio.twiml.VoiceResponse();
  }

  generateSayResponse(text, voice = CONFIG.TWILIO_VOICE) {
    const twiml = this.createVoiceResponse();
    twiml.say({ voice }, text);
    return twiml;
  }

  generateSayAndRedirectResponse(text, redirectUrl, voice = CONFIG.TWILIO_VOICE) {
    const twiml = this.createVoiceResponse();
    twiml.say({ voice }, text);
    twiml.redirect(redirectUrl);
    return twiml;
  }

  generateStreamResponse(streamUrl) {
    const twiml = this.createVoiceResponse();
    twiml.start().stream({
      url: streamUrl
    });
    return twiml;
  }

  async updateCall(callSid, twimlResponse) {
    try {
      await this.client.calls(callSid).update({
        twiml: twimlResponse.toString(),
      });
      return true;
    } catch (error) {
      console.error('Error updating call:', error);
      throw error;
    }
  }

  async speakToCustomer(callSid, text, redirectUrl = '/api/calls/re-enter-stream') {
    try {
      const twiml = this.generateSayAndRedirectResponse(text, redirectUrl);
      await this.updateCall(callSid, twiml);
      console.log('TwiML response sent, call redirected to re-enter stream.');
      return true;
    } catch (error) {
      console.error('Error sending TwiML response:', error);
      throw error;
    }
  }
}

export default TwilioService;