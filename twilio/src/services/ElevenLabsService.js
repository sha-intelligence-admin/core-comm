import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import logger from './LoggingService.js';

class ElevenLabsService {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Voice pools for load balancing and faster TTS generation
    this.voicePools = {
      primary: [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', type: 'professional_female', usage: 0 },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', type: 'professional_male', usage: 0 }
      ],
      secondary: [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', type: 'professional_female', usage: 0 },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', type: 'older_male', usage: 0 },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', type: 'young_female', usage: 0 }
      ],
      fallback: [
        { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', type: 'neutral_male', usage: 0 },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', type: 'neutral_male', usage: 0 }
      ]
    };

    // Default voice settings optimized for speed and quality
    this.defaultVoiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (primary)
    this.voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    };

    // Load balancing and performance tracking
    this.loadBalancing = {
      currentPool: 'primary',
      roundRobin: 0,
      failureThreshold: 3,
      resetInterval: 300000, // 5 minutes
      metrics: new Map()
    };

    // Voice pool health monitoring
    this.healthCheck = {
      lastCheck: Date.now(),
      checkInterval: 60000, // 1 minute
      unhealthyVoices: new Set()
    };

    // Initialize voice pool monitoring
    this.initializeVoicePoolMonitoring();
  }

  /**
   * Initialize voice pool monitoring and health checks
   */
  initializeVoicePoolMonitoring() {
    // Periodic health checks
    setInterval(() => {
      this.performVoicePoolHealthCheck();
    }, this.healthCheck.checkInterval);

    // Reset usage metrics periodically
    setInterval(() => {
      this.resetUsageMetrics();
    }, this.loadBalancing.resetInterval);

    logger.info('Voice pool monitoring initialized', {
      primaryVoices: this.voicePools.primary.length,
      secondaryVoices: this.voicePools.secondary.length,
      fallbackVoices: this.voicePools.fallback.length
    });
  }

  /**
   * Get optimal voice for TTS with load balancing
   */
  getOptimalVoice(priority = 'normal') {
    try {
      let selectedPool = this.voicePools.primary;
      let poolName = 'primary';

      // Priority-based pool selection
      if (priority === 'ultra-high') {
        // Always use primary pool for ultra-high priority
        selectedPool = this.voicePools.primary;
        poolName = 'primary';
      } else if (priority === 'high') {
        // Use primary or secondary pool
        selectedPool = this.loadBalancing.currentPool === 'primary' ? 
          this.voicePools.primary : this.voicePools.secondary;
        poolName = this.loadBalancing.currentPool;
      } else {
        // Use any available pool with load balancing
        if (this.isPoolHealthy('primary')) {
          selectedPool = this.voicePools.primary;
          poolName = 'primary';
        } else if (this.isPoolHealthy('secondary')) {
          selectedPool = this.voicePools.secondary;
          poolName = 'secondary';
        } else {
          selectedPool = this.voicePools.fallback;
          poolName = 'fallback';
        }
      }

      // Filter out unhealthy voices
      const healthyVoices = selectedPool.filter(voice => 
        !this.healthCheck.unhealthyVoices.has(voice.id)
      );

      if (healthyVoices.length === 0) {
        // Fallback to any available voice
        const allVoices = [...this.voicePools.primary, ...this.voicePools.secondary, ...this.voicePools.fallback];
        const voice = allVoices[0];
        logger.warn('No healthy voices found, using fallback', { voiceId: voice.id, name: voice.name });
        return voice;
      }

      // Round-robin selection within the pool
      const voice = healthyVoices[this.loadBalancing.roundRobin % healthyVoices.length];
      this.loadBalancing.roundRobin++;

      // Update usage metrics
      voice.usage++;
      this.trackVoiceUsage(voice.id, poolName);

      logger.debug('Optimal voice selected', {
        voiceId: voice.id,
        voiceName: voice.name,
        pool: poolName,
        priority,
        usage: voice.usage
      });

      return voice;
    } catch (error) {
      logger.error('Error selecting optimal voice', {
        error: error.message,
        priority
      });
      // Return default voice as fallback
      return { id: this.defaultVoiceId, name: 'Rachel', type: 'professional_female', usage: 0 };
    }
  }

  /**
   * Check if a voice pool is healthy
   */
  isPoolHealthy(poolName) {
    const pool = this.voicePools[poolName];
    if (!pool) return false;

    const healthyVoices = pool.filter(voice => 
      !this.healthCheck.unhealthyVoices.has(voice.id)
    );

    return healthyVoices.length >= Math.ceil(pool.length * 0.5); // At least 50% healthy
  }

  /**
   * Track voice usage for load balancing
   */
  trackVoiceUsage(voiceId, poolName) {
    const key = `${poolName}-${voiceId}`;
    
    if (!this.loadBalancing.metrics.has(key)) {
      this.loadBalancing.metrics.set(key, {
        requests: 0,
        failures: 0,
        totalLatency: 0,
        avgLatency: 0
      });
    }

    const metrics = this.loadBalancing.metrics.get(key);
    metrics.requests++;
  }

  /**
   * Track successful generation for performance metrics
   */
  trackGenerationSuccess(voiceId, latency) {
    const poolName = Object.keys(this.voicePools).find(name =>
      this.voicePools[name].find(voice => voice.id === voiceId)
    ) || 'unknown';

    const key = `${poolName}-${voiceId}`;
    const metrics = this.loadBalancing.metrics.get(key);
    
    if (metrics) {
      metrics.totalLatency += latency;
      metrics.avgLatency = metrics.totalLatency / metrics.requests;
    }
  }

  /**
   * Record voice failure for health monitoring
   */
  recordVoiceFailure(voiceId, error) {
    const key = Object.keys(this.voicePools).find(poolName =>
      this.voicePools[poolName].find(voice => voice.id === voiceId)
    );

    if (key) {
      const metricsKey = `${key}-${voiceId}`;
      const metrics = this.loadBalancing.metrics.get(metricsKey);
      
      if (metrics) {
        metrics.failures++;
        
        // Mark voice as unhealthy if failure rate is too high
        if (metrics.failures >= this.loadBalancing.failureThreshold) {
          this.healthCheck.unhealthyVoices.add(voiceId);
          
          logger.warn('Voice marked as unhealthy', {
            voiceId,
            failures: metrics.failures,
            requests: metrics.requests,
            error: error?.message
          });
        }
      }
    }
  }

  /**
   * Reset usage metrics periodically
   */
  resetUsageMetrics() {
    // Reset usage counters
    Object.values(this.voicePools).forEach(pool => {
      pool.forEach(voice => {
        voice.usage = 0;
      });
    });

    // Reset metrics but keep failure tracking
    for (const [key, metrics] of this.loadBalancing.metrics.entries()) {
      metrics.requests = 0;
      metrics.totalLatency = 0;
      metrics.avgLatency = 0;
      // Keep failures for health monitoring
    }

    // Reset unhealthy voices (give them another chance)
    this.healthCheck.unhealthyVoices.clear();

    logger.debug('Voice pool metrics reset');
  }

  /**
   * Perform health check on voice pools
   */
  async performVoicePoolHealthCheck() {
    const now = Date.now();
    
    if (now - this.healthCheck.lastCheck < this.healthCheck.checkInterval) {
      return; // Skip if checked recently
    }

    this.healthCheck.lastCheck = now;

    // Check primary pool health
    const primaryHealthy = this.isPoolHealthy('primary');
    const secondaryHealthy = this.isPoolHealthy('secondary');

    // Switch pools if primary is unhealthy
    if (!primaryHealthy && secondaryHealthy) {
      this.loadBalancing.currentPool = 'secondary';
      logger.warn('Switched to secondary voice pool due to primary pool health issues');
    } else if (primaryHealthy) {
      this.loadBalancing.currentPool = 'primary';
    }

    logger.debug('Voice pool health check completed', {
      primaryHealthy,
      secondaryHealthy,
      currentPool: this.loadBalancing.currentPool,
      unhealthyVoices: Array.from(this.healthCheck.unhealthyVoices)
    });
  }

  async generateSpeech(text, voiceId = null, options = {}) {
    try {
      const startTime = Date.now();
      
      // Select optimal voice if not specified
      const voice = voiceId ? 
        { id: voiceId, name: 'Custom', type: 'custom', usage: 0 } :
        this.getOptimalVoice(options.priority);

      const selectedVoiceId = voice.id;
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

      const generationTime = Date.now() - startTime;
      
      // Track successful generation metrics
      this.trackGenerationSuccess(selectedVoiceId, generationTime);

      return {
        audioBuffer,
        voiceId: selectedVoiceId,
        voiceName: voice.name,
        generationTime,
        success: true
      };

    } catch (error) {
      const generationTime = Date.now() - startTime;
      
      // Record voice failure for load balancing
      this.recordVoiceFailure(selectedVoiceId, error);
      
      logger.error('Error generating speech with ElevenLabs', {
        error: error.message,
        textPreview: text.substring(0, 50),
        voiceId: selectedVoiceId,
        voiceName: voice?.name,
        generationTime,
        priority: options.priority
      });

      // Try with fallback voice if original failed
      if (!voiceId && selectedVoiceId !== this.defaultVoiceId) {
        logger.info('Retrying with fallback voice', {
          originalVoice: selectedVoiceId,
          fallbackVoice: this.defaultVoiceId
        });
        
        return this.generateSpeech(text, this.defaultVoiceId, { 
          ...options, 
          isRetry: true 
        });
      }

      return {
        audioBuffer: null,
        voiceId: selectedVoiceId,
        voiceName: voice?.name,
        generationTime,
        success: false,
        error: error.message
      };
    }
  }

  async generateStreamingSpeech(text, voiceId = null, onChunk = null, options = {}) {
    try {
      const startTime = Date.now();
      
      // Select optimal voice if not specified
      const voice = voiceId ? 
        { id: voiceId, name: 'Custom', type: 'custom', usage: 0 } :
        this.getOptimalVoice(options.priority);

      const selectedVoiceId = voice.id;
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