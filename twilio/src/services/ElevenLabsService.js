import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import logger from './LoggingService.js';

class ElevenLabsService {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Default voice settings - you can customize these
    this.defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL';
    // Alternative voices:
    // 'pNInz6obpgDQGcFmaJgB' - Adam (professional male)
    // 'EXAVITQu4vr4xnSDxMaL' - Bella (professional female)
    // 'VR6AewLTigWG4xSOukaG' - Arnold (older male)
    // 'MF3mGyEYCl7XYWbV9V6O' - Elli (young female)
    
    this.voiceSettings = {
      stability: 0.75,           // Lower for more variation (less robotic)
      similarity_boost: 0.75,    // Slightly lower for more natural deviation
      style: 0.85,              // Higher for more expressive speech
      use_speaker_boost: true,   // Enhance voice characteristics
      optimize_streaming_latency: 2,
    };
  }

  async generateSpeech(text, voiceId = null, options = {}) {
    try {
      const selectedVoiceId = this.defaultVoiceId;
      const voiceSettings = { ...this.voiceSettings, ...options.voice_settings };

      logger.info('Generating speech with ElevenLabs', {
        textLength: text.length,
        voiceId: selectedVoiceId,
        textPreview: text.substring(0, 50)
      });

      // Use the correct API method for v2.12.0
      const audioResponse = await this.client.textToSpeech.convert(selectedVoiceId, {
        text: text,
        voice_settings: voiceSettings,
        model_id: options.model_id || 'eleven_monolingual_v1',
        output_format: 'mp3_22050_32'
      });

      // Convert response to buffer
      let audioBuffer;
      if (audioResponse instanceof Buffer) {
        audioBuffer = audioResponse;
      } else if (audioResponse.audio) {
        audioBuffer = audioResponse.audio;
      } else {
        // Handle stream response
        const chunks = [];
        for await (const chunk of audioResponse) {
          chunks.push(chunk);
        }
        audioBuffer = Buffer.concat(chunks);
      }
      
      logger.info('Speech generated successfully', {
        audioSize: audioBuffer.length,
        voiceId: selectedVoiceId
      });

      return {
        audioBuffer,
        voiceId: selectedVoiceId,
        success: true
      };

    } catch (error) {
      logger.error('Error generating speech with ElevenLabs', {
        error: error.message,
        textPreview: text.substring(0, 50),
        voiceId: this.defaultVoiceId
      });

      return {
        audioBuffer: null,
        voiceId: this.defaultVoiceId,
        success: false,
        error: error.message
      };
    }
  }

  async generateStreamingSpeech(text, voiceId = null, onChunk = null, options = {}) {
    try {
      const selectedVoiceId = this.defaultVoiceId;
      const voiceSettings = { ...this.voiceSettings, ...options.voice_settings };

      logger.info('Generating streaming speech with ElevenLabs', {
        textLength: text.length,
        voiceId: selectedVoiceId
      });

      // Use the correct streaming API method for v2.12.0
      const audioStream = await this.client.textToSpeech.stream(selectedVoiceId, {
        text: text,
        voice_settings: voiceSettings,
        model_id: options.model_id || 'eleven_monolingual_v1',
        output_format: 'mp3_22050_32'
      });

      const chunks = [];
      
      // Handle the stream
      for await (const chunk of audioStream) {
        chunks.push(chunk);
        if (onChunk) {
          onChunk(chunk);
        }
      }

      const audioBuffer = Buffer.concat(chunks);
      
      logger.info('Streaming speech generated successfully', {
        audioSize: audioBuffer.length,
        voiceId: selectedVoiceId,
        chunksReceived: chunks.length
      });

      return {
        audioBuffer,
        voiceId: selectedVoiceId,
        success: true,
        chunks: chunks.length
      };

    } catch (error) {
      logger.error('Error generating streaming speech with ElevenLabs', {
        error: error.message,
        textPreview: text.substring(0, 50),
        voiceId: this.defaultVoiceId
      });

      return {
        audioBuffer: null,
        voiceId: this.defaultVoiceId,
        success: false,
        error: error.message
      };
    }
  }

  async getAvailableVoices() {
    try {
      const voices = await this.client.voices.getAll();
      
      logger.info('Retrieved available voices', {
        voiceCount: voices?.voices?.length || 0
      });

      return voices?.voices || [];
    } catch (error) {
      logger.error('Error retrieving voices', {
        error: error.message
      });
      return [];
    }
  }

  async getVoiceSettings(voiceId) {
    try {
      const voice = await this.client.voices.get(voiceId);
      return voice;
    } catch (error) {
      logger.error('Error retrieving voice settings', {
        error: error.message,
        voiceId
      });
      return null;
    }
  }

  setDefaultVoice(voiceId) {
    this.defaultVoiceId = voiceId;
    logger.info('Default voice updated', { voiceId });
  }

  updateVoiceSettings(settings) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
    logger.info('Voice settings updated', { settings });
  }

  // Helper method to convert audio buffer to base64 for Twilio
  audioBufferToBase64(audioBuffer) {
    return audioBuffer.toString('base64');
  }

  // Method to optimize text for TTS (remove special characters, etc.)
  optimizeTextForTTS(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .replace(/[^\w\s.,!?'-]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 2500); // Limit length for TTS
  }
}

export default ElevenLabsService;