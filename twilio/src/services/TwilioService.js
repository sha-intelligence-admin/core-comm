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

    // Keep call alive with long pause
    // twiml.pause({ length: 3600 });

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

  async speakToCustomer(callSid, text, audioBuffer = null) {
    try {
      let twiml;
      
      if (audioBuffer) {
        // Use custom audio from ElevenLabs
        // Note: This would require hosting the audio file temporarily
        // For now, falling back to Twilio's TTS but this is where you'd
        // implement the audio hosting logic
        console.log('Custom audio buffer provided, but using fallback TTS');
        twiml = `<Response><Say voice="alice">${text}</Say><Pause length="3600"/></Response>`;
      } else {
        // Use Twilio's built-in TTS
        twiml = `<Response><Say voice="alice">${text}</Say><Pause length="3600"/></Response>`;
      }
      
      await this.client.calls(callSid).update({ twiml });
      console.log('TTS sent successfully - stream continues');
      return true;
    } catch (error) {
      console.error('Error sending TTS:', error);
      throw error;
    }
  }

  generatePlayResponse(audioUrl) {
    const twiml = this.createVoiceResponse();
    twiml.play(audioUrl);
    twiml.pause({ length: 3600 }); // Keep call alive
    return twiml;
  }

  async playAudioToCustomer(callSid, audioUrl) {
    try {
      const twiml = `<Response><Play>${audioUrl}</Play><Pause length="3600"/></Response>`;
      
      await this.client.calls(callSid).update({ twiml });
      console.log('Audio playback sent successfully - stream continues');
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }
}

export default TwilioService;
