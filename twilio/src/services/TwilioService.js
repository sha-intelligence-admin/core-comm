import twilio from 'twilio';
import { CONFIG } from '../config/config.js';
import CallSessionManager from '../services/CallSessionManager.js';
import logger from './LoggingService.js';

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
    return twiml;
  }

  async playAudioToCustomer(callSid, audioUrl) {
    try {
      const twiml = `<Response><Play>${audioUrl}</Play><Pause length="3600"/></Response>`;

      await this.client.calls(callSid).update({ twiml });
      logger.info('Audio playback sent successfully - stream continues');
      return true;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  async hangupCall(callSid) {
    try {
      console.log(`Attempting to hang up call: ${callSid}`);

      // Update the call with hangup TwiML
      const hangupTwiml = '<Response><Hangup/></Response>';

      await this.client.calls(callSid).update({
        twiml: hangupTwiml,
      });

      console.log(`Call ${callSid} hung up successfully`);
      return true;
    } catch (error) {
      console.error('Error hanging up call:', error);

      // Alternative method: Update call status to completed
      try {
        console.log(`Trying alternative method to end call ${callSid}`);
        await this.client.calls(callSid).update({
          status: 'completed',
        });
        console.log(`Call ${callSid} marked as completed`);
        return true;
      } catch (altError) {
        console.error('Alternative hangup method also failed:', altError);
        throw error;
      }
    }
  }

  async speakAndHangup(callSid, goodbyeMessage) {
    try {
      console.log(
        `Speaking goodbye with ElevenLabs and hanging up call: ${callSid}`
      );

      const useElevenLabs = process.env.USE_ELEVENLABS_TTS === 'true';

      if (useElevenLabs) {
        const encodedText = Buffer.from(goodbyeMessage).toString('base64');
        const audioUrl = `${
          process.env.NGROK_URL || 'localhost:3001'
        }/api/audio/dynamic?text=${encodedText}`;

        // Use Play with hangup - let TwiML handle the sequencing
        const twiml = `<Response>
        <Play>${audioUrl}</Play>
        <Pause length="1"/>
        <Hangup/>
      </Response>`;

        await this.client.calls(callSid).update({ twiml });
        console.log(
          `ElevenLabs goodbye audio sent and call ${callSid} will be hung up`
        );

        // Schedule cleanup after estimated audio duration
        const audioDuration = this.estimateAudioDuration(goodbyeMessage);
        setTimeout(() => {
          // Clean up the session after audio completes
          CallSessionManager.removeCallSession(callSid, 'completed-goodbye');
        }, audioDuration + 2000);
      } else {
        // Fallback to Twilio TTS
        const twiml = `<Response>
        <Say voice="alice">${goodbyeMessage}</Say>
        <Pause length="2"/>
        <Hangup/>
      </Response>`;

        await this.client.calls(callSid).update({ twiml });
      }

      return true;
    } catch (error) {
      console.error('Error in speakAndHangup:', error);
      throw error;
    }
  }

  // Add this helper method to TwilioService
  estimateAudioDuration(text) {
    const wordCount = text.split(/\s+/).length;
    const baseDuration = (wordCount / 2.5) * 1000; // ~2.5 words per second for ElevenLabs
    return Math.max(2000, baseDuration); // Minimum 2 seconds
  }

  async getCallDetails(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        from: call.from,
        to: call.to,
      };
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw error;
    }
  }

  async isCallActive(callSid) {
    try {
      const call = await this.client.calls(callSid).fetch();
      return ['ringing', 'in-progress', 'queued'].includes(call.status);
    } catch (error) {
      console.error('Error checking call status:', error);
      return false;
    }
  }
}

export default TwilioService;
