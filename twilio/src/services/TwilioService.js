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

  generateSayResponse(text) {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say(
      {
        voice: 'alice',
        language: 'en-US',
      },
      text
    );

    // CRITICAL FIX: Just pause briefly, don't terminate
    twiml.pause({ length: 1 });

    return twiml.toString();
  }

  generateSayAndRedirectResponse(
    text,
    redirectUrl,
    voice = CONFIG.TWILIO_VOICE
  ) {
    const twiml = this.createVoiceResponse();
    twiml.say({ voice }, text);
    twiml.redirect(redirectUrl);
    return twiml;
  }

  generateStreamResponse(streamUrl) {
    const twiml = this.createVoiceResponse();
    twiml.start().stream({
      url: streamUrl,
    });
    return twiml;
  }

  generateSayAndConnectResponse(text, streamUrl) {
    const twiml = this.createVoiceResponse();
    twiml.say(
      {
        voice: 'alice',
        language: 'en-US',
      },
      text
    );
    // CRITICAL FIX: Add a <Connect> verb to reconnect the stream
    twiml.connect().stream({ url: streamUrl });
    return twiml;
  }

  async updateCall(callSid, twimlResponse) {
  try {
    const twimlString = twimlResponse.toString();
    console.log(`Sending TwiML to Twilio for call SID ${callSid}:`);
    console.log(twimlString); // Log the TwiML string here

    await this.client.calls(callSid).update({
      twiml: twimlString,
    });
    return true;
  } catch (error) {
    console.error('Error updating call:', error);
    throw error;
  }
}

  async speakToCustomer(callSid, text, streamUrl) {
    try {
      // Use the new, correct TwiML generator
      const twiml = this.generateSayAndConnectResponse(text, streamUrl);
      await this.updateCall(callSid, twiml);
      console.log('TTS sent successfully - stream continues');
      return true;
    } catch (error) {
      console.error('Error sending TwiML response:', error);
      throw error;
    }
  }
}

export default TwilioService;
