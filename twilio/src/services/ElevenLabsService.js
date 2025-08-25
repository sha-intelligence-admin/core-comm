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
      use_speaker_boost: false, // Disable for faster processing
    };

    // Audio cache for repeated phrases
    this.audioCache = new Map();
    this.maxCacheSize = 200; // Change from 100 to 200
  }

  async generateSpeech(text, options = {}) {
    const startTime = Date.now();
    const cacheKey = options.cacheKey || `${text}:${this.voiceId}`;

    try {
      // Check cache first for exact text matches
      if (this.audioCache.has(cacheKey)) {
        logger.info('Using cached ElevenLabs audio', {
          textLength: text.length,
          responseTime: Date.now() - startTime,
          cached: true,
        });
        return this.audioCache.get(cacheKey);
      }

      const requestBody = {
        text: text.substring(0, 500), // Limit text length for faster processing
        model_id: 'eleven_turbo_v2', // Fastest model
        voice_settings: {
          ...this.voiceSettings,
          ...options.voice_settings,
        },
      };

      // Add optimization parameters
      const url = `${this.baseURL}/text-to-speech/${this.voiceId}?optimize_streaming_latency=${CONFIG.ELEVENLABS_OPTIMIZE_LATENCY}&output_format=${CONFIG.ELEVENLABS_OUTPUT_FORMAT}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
        timeout: CONFIG.TTS_TIMEOUT,
      });

      if (!response.ok) {
        throw new Error(
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      const audioBuffer = await response.buffer();
      this.audioCache.set(cacheKey, audioBuffer);

      // Cache successful results
      if (this.audioCache.size >= this.maxCacheSize) {
        // Remove oldest entry
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }

      const responseTime = Date.now() - startTime;
      logger.info('ElevenLabs speech generated', {
        textLength: text.length,
        audioSize: audioBuffer.length,
        responseTime,
        cached: false,
      });

      return audioBuffer;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('ElevenLabs generation failed', {
        error: error.message,
        textLength: text.length,
        responseTime,
      });
      throw error;
    }
  }

  // Pre-generate common phrases
  async preloadCommonAudio() {
    // Pre-generate actual pattern responses for instant delivery
    const commonPhrases = [
      "We're Sha Intelligence, building safe, secure, privacy-first AI systems that amplify your intelligence while maintaining trust, safety, and purpose.",
      'We offer subscription-based models, enterprise licensing of Signal AI for telcos and large institutions, and custom API deployments for fintechs, banks, and secure environments.',
      'You can reach us at info@shaintelligence.com, visit shaintelligence.com, or call +44 7853 257472.',
      "Founded by Ibrahim BK as CEO, with Yaqub Ja'e as CTO, Ibrahim B Balogun as Head of Security, and Neemah Lawal as COO.",
      "Scalable B2B model with subscription services, enterprise licensing, and custom API deployments. We've generated $150k+ in early revenue.",
      'We have generated over $150,000 in revenue through pilot subscriptions and API access on Core Comm, demonstrating strong early traction.',
      'AI market projected to reach $3.68 trillion by 2034 with 19.20% annual growth rate according to Precedence Research.',
      'We have 45.86% month-on-month user growth rate and have onboarded over 100 users so far.',
      'Most AI systems overlook safety, privacy, and human alignment, putting people at risk. Trust is missing in AI.',
      'We build decentralized AI systems that are safe, secure, and privacy-first by design, putting people in control.',
      'Build AI systems that are safe, secure, and privacy-first, designed to serve people, not exploit them.',
      'Shape a future where AI empowers humanity with trust, safety, and purpose.',
      "Now is the critical time to build trustworthy AI. We must build it now, before it's too late.",

      // Common interaction phrases
      'Thank you for calling!',
      'How can I help you today?',
      "I'm sorry, could you repeat that?",
      'Have a great day!',
      'One moment please.',
      "You're welcome! If you have more questions or need assistance, feel free to reach out. Have a great day!",
      "Thank you for calling! Have a wonderful day and don't hesitate to reach out if you need anything else.",
      "I'm having trouble processing that. Could you rephrase your question?",
    ];

    logger.info('Preloading common audio phrases', {
      phraseCount: commonPhrases.length,
    });

    // Process phrases sequentially with delays to avoid rate limits
    for (let i = 0; i < commonPhrases.length; i++) {
      try {
        await this.generateSpeech(commonPhrases[i]);
        logger.debug(`Preloaded phrase ${i + 1}/${commonPhrases.length}`);

        // Add 200ms delay between requests to avoid rate limits
        if (i < commonPhrases.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        logger.warn(
          `Failed to preload phrase ${i + 1}: "${commonPhrases[i].substring(
            0,
            50
          )}..."`,
          {
            error: error.message,
          }
        );

        // If rate limited, wait longer before continuing
        if (error.message.includes('429')) {
          logger.info('Rate limit hit, waiting 2 seconds before continuing...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }
    logger.info(`Preloaded ${this.audioCache.size} common audio phrases`);
  }

  getCacheStats() {
    return {
      cacheSize: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      cacheKeys: Array.from(this.audioCache.keys()).map((key) =>
        key.substring(0, 50)
      ),
    };
  }
}

export default ElevenLabsService;
