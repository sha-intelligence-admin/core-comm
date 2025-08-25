import fetch from 'node-fetch';
import { CONFIG } from '../config/config.js';
import logger from './LoggingService.js';

class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    this.baseURL = 'https://api.elevenlabs.io/v1';
    
    // Optimized voice settings for speed
    this.voiceSettings = {
      stability: CONFIG.ELEVENLABS_STABILITY,
      similarity_boost: CONFIG.ELEVENLABS_SIMILARITY_BOOST,
      style: 0.0, // Neutral style for consistency
      use_speaker_boost: false // Disable for faster processing
    };

    // Audio cache for repeated phrases
    this.audioCache = new Map();
    this.maxCacheSize = 100;
  }

  async generateSpeech(text, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check cache first for exact text matches
      const cacheKey = `${text}:${this.voiceId}`;
      if (this.audioCache.has(cacheKey)) {
        logger.info('Using cached ElevenLabs audio', {
          textLength: text.length,
          responseTime: Date.now() - startTime
        });
        return this.audioCache.get(cacheKey);
      }

      const requestBody = {
        text: text.substring(0, 500), // Limit text length for faster processing
        model_id: 'eleven_turbo_v2', // Fastest model
        voice_settings: {
          ...this.voiceSettings,
          ...options.voice_settings
        }
      };

      // Add optimization parameters
      const url = `${this.baseURL}/text-to-speech/${this.voiceId}?optimize_streaming_latency=${CONFIG.ELEVENLABS_OPTIMIZE_LATENCY}&output_format=${CONFIG.ELEVENLABS_OUTPUT_FORMAT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
        timeout: CONFIG.TTS_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.buffer();
      
      // Cache successful results
      if (this.audioCache.size >= this.maxCacheSize) {
        // Remove oldest entry
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }
      this.audioCache.set(cacheKey, audioBuffer);

      const responseTime = Date.now() - startTime;
      logger.info('ElevenLabs speech generated', {
        textLength: text.length,
        audioSize: audioBuffer.length,
        responseTime,
        cached: false
      });

      return audioBuffer;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('ElevenLabs generation failed', {
        error: error.message,
        textLength: text.length,
        responseTime
      });
      throw error;
    }
  }

  // Pre-generate common phrases
  async preloadCommonAudio() {
    const commonPhrases = [
      "Thank you for calling!",
      "How can I help you today?",
      "I'm sorry, could you repeat that?",
      "Have a great day!",
      "One moment please.",
    ];

    logger.info('Preloading common audio phrases');
    
    const promises = commonPhrases.map(phrase => 
      this.generateSpeech(phrase).catch(error => 
        logger.warn(`Failed to preload: "${phrase}"`, error.message)
      )
    );
    
    await Promise.allSettled(promises);
    logger.info(`Preloaded ${this.audioCache.size} common audio phrases`);
  }

  getCacheStats() {
    return {
      cacheSize: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      cacheKeys: Array.from(this.audioCache.keys()).map(key => key.substring(0, 50))
    };
  }
}

export default ElevenLabsService;