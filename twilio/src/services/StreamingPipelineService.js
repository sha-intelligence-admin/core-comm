import logger from './LoggingService.js';
import OpenAIService from './OpenAIService.js';
import ElevenLabsService from './ElevenLabsService.js';
import TwilioService from './TwilioService.js';
import CallSessionManager from './CallSessionManager.js';
import PredictiveCacheService from './PredictiveCacheService.js';
import PerformanceMonitorService from './PerformanceMonitorService.js';
import CircuitBreakerService from './CircuitBreakerService.js';
import { CONFIG } from '../config/config.js';

class StreamingPipelineService {
  constructor() {
    this.openaiService = new OpenAIService();
    this.elevenLabsService = new ElevenLabsService();
    this.twilioService = new TwilioService();
    this.cacheService = PredictiveCacheService.getInstance();
    this.performanceMonitor = PerformanceMonitorService.getInstance();
    this.circuitBreakerService = CircuitBreakerService.getInstance();
    
    // Audio chunk management
    this.activeStreams = new Map();
    this.audioChunkBuffer = new Map();
    
    // Performance tracking
    this.streamMetrics = new Map();
    
    // Production safety limits
    this.concurrentStreamLimit = CONFIG.MAX_CONCURRENT_STREAMS || 100;
    this.memoryUsageLimit = CONFIG.MAX_CACHE_MEMORY_MB * 1024 * 1024; // Convert to bytes
    
    // Error recovery state
    this.errorRecovery = {
      consecutiveFailures: 0,
      lastFailureTime: null,
      degradedMode: false
    };
    
    // Health monitoring
    this.healthStatus = {
      isHealthy: true,
      lastHealthCheck: Date.now(),
      services: {
        openai: 'healthy',
        elevenlabs: 'healthy',
        twilio: 'healthy',
        cache: 'healthy'
      }
    };
    
    // Setup periodic health checks
    this.setupHealthMonitoring();
  }

  // Singleton pattern to ensure shared state
  static getInstance() {
    if (!StreamingPipelineService.instance) {
      StreamingPipelineService.instance = new StreamingPipelineService();
    }
    return StreamingPipelineService.instance;
  }

  /**
   * Setup health monitoring for production safety
   */
  setupHealthMonitoring() {
    // Periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, CONFIG.HEALTH_CHECK_INTERVAL);
    
    // Memory usage monitoring
    setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000); // Every 30 seconds
    
    // Stream limit monitoring
    setInterval(() => {
      this.monitorConcurrentStreams();
    }, 10000); // Every 10 seconds
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      const healthResults = {};
      
      // Check OpenAI service
      healthResults.openai = await this.checkServiceHealth('openai', async () => {
        // Simple health check - could be enhanced with actual API call
        return this.openaiService ? 'healthy' : 'unhealthy';
      });
      
      // Check ElevenLabs service  
      healthResults.elevenlabs = await this.checkServiceHealth('elevenlabs', async () => {
        return this.elevenLabsService ? 'healthy' : 'unhealthy';
      });
      
      // Check Twilio service
      healthResults.twilio = await this.checkServiceHealth('twilio', async () => {
        return this.twilioService ? 'healthy' : 'unhealthy';
      });
      
      // Check cache service
      healthResults.cache = await this.checkServiceHealth('cache', async () => {
        const metrics = this.cacheService.getMetrics();
        return metrics ? 'healthy' : 'unhealthy';
      });
      
      // Update health status
      this.healthStatus.services = healthResults;
      this.healthStatus.lastHealthCheck = Date.now();
      this.healthStatus.isHealthy = Object.values(healthResults).every(status => 
        status === 'healthy' || status === 'degraded'
      );
      
      // Log health status
      if (!this.healthStatus.isHealthy) {
        logger.warn('System health check failed', {
          services: healthResults,
          activeStreams: this.activeStreams.size,
          memoryUsage: process.memoryUsage()
        });
      } else {
        logger.debug('System health check passed', {
          services: healthResults,
          activeStreams: this.activeStreams.size
        });
      }
      
    } catch (error) {
      logger.error('Health check failed', {
        error: error.message
      });
      this.healthStatus.isHealthy = false;
    }
  }

  /**
   * Check individual service health with circuit breaker
   */
  async checkServiceHealth(serviceName, healthCheckFn) {
    try {
      const result = await this.circuitBreakerService.executeWithCircuitBreaker(
        serviceName,
        healthCheckFn,
        () => 'degraded', // Fallback
        { timeout: CONFIG.SERVICE_HEALTH_TIMEOUT }
      );
      return result;
    } catch (error) {
      logger.warn(`Service health check failed: ${serviceName}`, {
        error: error.message
      });
      return 'unhealthy';
    }
  }

  /**
   * Monitor memory usage and cleanup if needed
   */
  monitorMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMemoryMB = memUsage.heapUsed / 1024 / 1024;
    
    if (totalMemoryMB > CONFIG.MAX_CACHE_MEMORY_MB) {
      logger.warn('Memory usage exceeds limit, performing cleanup', {
        currentUsage: Math.round(totalMemoryMB),
        limit: CONFIG.MAX_CACHE_MEMORY_MB,
        activeStreams: this.activeStreams.size
      });
      
      this.performMemoryCleanup();
    }
  }

  /**
   * Monitor concurrent streams and enforce limits
   */
  monitorConcurrentStreams() {
    const activeCount = this.activeStreams.size;
    
    if (activeCount > this.concurrentStreamLimit) {
      logger.error('Concurrent stream limit exceeded', {
        activeStreams: activeCount,
        limit: this.concurrentStreamLimit
      });
      
      // Emergency cleanup of oldest streams
      this.emergencyStreamCleanup();
    }
  }

  /**
   * Perform memory cleanup
   */
  performMemoryCleanup() {
    let cleanedStreams = 0;
    const now = Date.now();
    const maxAge = CONFIG.CALL_SESSION_MAX_AGE;
    
    // Clean up old streams
    for (const [callSid, streamState] of this.activeStreams.entries()) {
      if (now - streamState.startTime > maxAge && !streamState.isActive) {
        this.cleanupStream(callSid);
        cleanedStreams++;
      }
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    logger.info('Memory cleanup completed', {
      cleanedStreams,
      remainingStreams: this.activeStreams.size,
      memoryAfter: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    });
  }

  /**
   * Emergency cleanup of streams when limit exceeded
   */
  emergencyStreamCleanup() {
    const streamsArray = Array.from(this.activeStreams.entries());
    const oldestStreams = streamsArray
      .sort(([, a], [, b]) => a.startTime - b.startTime)
      .slice(0, 10); // Clean up 10 oldest streams
    
    let cleaned = 0;
    for (const [callSid] of oldestStreams) {
      this.gracefulStreamTermination(callSid, 'emergency_cleanup');
      cleaned++;
    }
    
    logger.warn('Emergency stream cleanup performed', {
      cleanedStreams: cleaned,
      remainingStreams: this.activeStreams.size
    });
  }

  /**
   * Validate input parameters for production safety
   */
  validateInput(callSid, transcript) {
    if (!callSid || typeof callSid !== 'string') {
      throw new Error('Invalid callSid provided');
    }
    
    if (!transcript || typeof transcript !== 'string') {
      throw new Error('Invalid transcript provided');
    }
    
    if (transcript.length > CONFIG.MAX_TEXT_LENGTH) {
      throw new Error(`Transcript too long: ${transcript.length} > ${CONFIG.MAX_TEXT_LENGTH}`);
    }
    
    // Check for concurrent stream limits
    if (this.activeStreams.size >= this.concurrentStreamLimit) {
      throw new Error(`Concurrent stream limit reached: ${this.activeStreams.size}`);
    }
  }

  /**
   * Initialize streaming pipeline for a call
   */
  initializeStream(callSid) {
    const streamState = {
      callSid,
      isActive: true,
      textBuffer: '',
      audioChunks: [],
      currentAudioIndex: 0,
      totalLatency: 0,
      chunkCount: 0,
      startTime: Date.now()
    };

    this.activeStreams.set(callSid, streamState);
    this.audioChunkBuffer.set(callSid, []);
    this.streamMetrics.set(callSid, {
      textToSpeechLatency: [],
      audioDeliveryLatency: [],
      totalResponseTime: 0
    });

    logger.info('Streaming pipeline initialized', { callSid });
    return streamState;
  }

  /**
   * Process customer speech with ultra-fast parallel streaming response (Production Ready)
   */
  async processStreamingResponse(callSid, transcript) {
    // Input validation
    try {
      this.validateInput(callSid, transcript);
    } catch (error) {
      logger.error('Input validation failed', {
        callSid,
        error: error.message
      });
      throw error;
    }
    
    // Health check
    if (!this.healthStatus.isHealthy && !this.errorRecovery.degradedMode) {
      logger.warn('System unhealthy, enabling degraded mode', {
        callSid,
        healthStatus: this.healthStatus.services
      });
      this.errorRecovery.degradedMode = true;
    }
    const streamStart = Date.now();
    const streamState = this.activeStreams.get(callSid);
    
    if (!streamState || !streamState.isActive) {
      logger.warn('Stream not active for call', { callSid });
      return;
    }

    const callSession = CallSessionManager.getCallSession(callSid);
    if (!callSession || callSession.isEnding) return;

    logger.info('Starting ultra-fast parallel streaming pipeline', {
      callSid,
      transcript: transcript.substring(0, 50),
      timestamp: streamStart
    });

    try {
      // Initialize parallel processing streams
      const textChunks = [];
      const audioQueue = [];
      let responseBuffer = '';
      let wordCount = 0;
      let audioChunkIndex = 0;
      
      // Start Twilio audio playback immediately with streaming endpoint
      const streamingUrl = await this.initializeAudioStream(callSid);
      
      // Create real-time text processing pipeline
      const textProcessor = (chunk, fullResponse) => {
        responseBuffer = fullResponse;
        const newWords = chunk.trim().split(/\s+/).filter(w => w.length > 0);
        wordCount += newWords.length;
        
        // Update stream state for monitoring
        const currentState = this.activeStreams.get(callSid);
        if (currentState) {
          currentState.textBuffer = fullResponse;
          currentState.wordCount = wordCount;
        }
        
        // Enhanced text chunk processing with word-boundary streaming
        if (wordCount >= CONFIG.MIN_WORDS_FOR_TTS) {
          let textChunksToProcess = [];
          
          if (CONFIG.ENABLE_WORD_BOUNDARY_STREAMING && wordCount >= CONFIG.WORD_CHUNK_THRESHOLD) {
            // Use word-boundary streaming for faster response
            textChunksToProcess = this.extractWordBoundaryChunks(responseBuffer);
          } else {
            // Use sentence-boundary streaming
            textChunksToProcess = this.extractStreamingSentences(responseBuffer);
          }
          
          textChunksToProcess.forEach(chunkText => {
            if (chunkText.trim().length >= CONFIG.TEXT_CHUNK_MIN_LENGTH && 
                !textChunks.some(tc => tc.text === chunkText)) {
              
              const textChunk = {
                text: chunkText,
                index: audioChunkIndex++,
                timestamp: Date.now(),
                wordCount: chunkText.split(/\s+/).length,
                type: CONFIG.ENABLE_WORD_BOUNDARY_STREAMING ? 'word-boundary' : 'sentence'
              };
              
              textChunks.push(textChunk);
              
              // Generate TTS with circuit breaker protection
              this.circuitBreakerService.executeWithCircuitBreaker(
                'elevenlabs',
                () => this.generateAndStreamAudioChunkParallel(callSid, textChunk),
                null // No fallback for TTS chunks - let it fail gracefully
              )
                .then(audioChunk => {
                  if (audioChunk) {
                    audioQueue.push(audioChunk);
                    // Immediately forward to streaming endpoint
                    this.forwardAudioChunkToStream(callSid, audioChunk);
                  }
                })
                .catch(error => {
                  logger.error('Circuit breaker protected TTS generation failed', {
                    callSid,
                    error: error.message,
                    text: chunkText.substring(0, 30),
                    chunkType: textChunk.type
                  });
                  
                  // Record failure for error recovery
                  this.recordProcessingFailure(error);
                });
            }
          });
        }
      };

      // Start OpenAI streaming with circuit breaker protection
      const openaiPromise = this.circuitBreakerService.executeWithCircuitBreaker(
        'openai',
        () => this.openaiService.generateStreamingResponse(
          transcript,
          callSession.conversationHistory?.slice(-6) || [],
          textProcessor
        ),
        async () => {
          // Fallback to cached response
          logger.warn('OpenAI circuit breaker activated, using fallback', { callSid });
          return await this.sendCachedResponse(callSid, transcript) || 
            "I'm experiencing some technical difficulties. Let me help you in just a moment.";
        }
      );

      // Check predictive cache first for instant responses
      const cachedResponse = await this.cacheService.getCachedResponse(transcript, callSid);
      
      if (cachedResponse) {
        logger.info('Using cached response for instant delivery', { 
          callSid, 
          patterns: cachedResponse.patterns,
          response: cachedResponse.response.substring(0, 30) 
        });
        
        // Check for cached audio
        const cachedAudio = await this.cacheService.getCachedAudio(cachedResponse.response, callSid);
        
        if (cachedAudio) {
          // Stream cached audio immediately
          const audioChunk = {
            audio: cachedAudio.audioBuffer,
            index: audioChunkIndex++,
            timestamp: Date.now(),
            cached: true,
            priority: 'ultra-high'
          };
          
          this.forwardAudioChunkToStream(callSid, audioChunk);
          
          // Update conversation context for better future predictions
          this.cacheService.updateConversationContext(callSid, transcript, cachedResponse.response);
          
          logger.info('Cached audio delivered instantly', {
            callSid,
            audioSize: cachedAudio.size,
            totalTime: Date.now() - streamStart
          });
          
          // Record ultra-fast cached performance
          this.performanceMonitor.recordResponseMetrics(callSid, {
            totalLatency: Date.now() - streamStart,
            responseType: 'cached',
            cacheHit: true,
            audioSize: cachedAudio.size,
            textLength: cachedResponse.response.length
          });
          
          return; // Ultra-fast cached response path
        } else {
          // Generate audio for cached response
          const quickAudio = await this.generateAndStreamAudioChunkParallel(callSid, {
            text: cachedResponse.response,
            index: audioChunkIndex++,
            timestamp: Date.now(),
            priority: 'high',
            cached: true
          });
          
          if (quickAudio) {
            this.forwardAudioChunkToStream(callSid, quickAudio);
            
            // Cache the generated audio for next time
            this.cacheService.generateAndCacheAudio(cachedResponse.response, 
              this.cacheService.generateCacheKey(cachedResponse.response), callSid);
          }
          
          this.cacheService.updateConversationContext(callSid, transcript, cachedResponse.response);
          
          // Record cached response with audio generation
          this.performanceMonitor.recordResponseMetrics(callSid, {
            totalLatency: Date.now() - streamStart,
            responseType: 'cached',
            cacheHit: true,
            audioGenerationTime: quickAudio?.latency || 0,
            textLength: cachedResponse.response.length
          });
          
          return; // Fast cached response path
        }
      }

      // Check for ultra-high priority responses first (instant responses)
      const ultraHighPriorityResponse = await this.checkUltraHighPriorityResponse(transcript, callSid);
      
      if (ultraHighPriorityResponse) {
        logger.info('Using ultra-high priority instant response', { 
          callSid, 
          response: ultraHighPriorityResponse.substring(0, 30),
          responseTime: '< 10ms'
        });
        
        const quickAudio = await this.generateAndStreamAudioChunkParallel(callSid, {
          text: ultraHighPriorityResponse,
          index: audioChunkIndex++,
          timestamp: Date.now(),
          priority: 'ultra-high'
        });
        
        if (quickAudio) {
          this.forwardAudioChunkToStream(callSid, quickAudio);
        }
        
        this.cacheService.cacheResponseAndAudio(transcript, ultraHighPriorityResponse, callSid);
        this.cacheService.updateConversationContext(callSid, transcript, ultraHighPriorityResponse);
        
        return;
      }

      // Parallel quick response detection for patterns not in cache
      const quickResponsePromise = this.checkQuickResponse(transcript, callSid);
      
      // Race between quick response and streaming response with optimized timeout
      const quickResponse = await Promise.race([
        quickResponsePromise,
        new Promise(resolve => setTimeout(() => resolve(null), CONFIG.QUICK_RESPONSE_TIMEOUT || 25))
      ]);

      if (quickResponse) {
        logger.info('Using instant quick response (not cached)', { callSid, response: quickResponse.substring(0, 30) });
        
        // Generate and stream quick response immediately
        const quickAudio = await this.generateAndStreamAudioChunkParallel(callSid, {
          text: quickResponse,
          index: audioChunkIndex++,
          timestamp: Date.now(),
          priority: 'high'
        });
        
        if (quickAudio) {
          this.forwardAudioChunkToStream(callSid, quickAudio);
        }
        
        // Cache this response for future use
        this.cacheService.cacheResponseAndAudio(transcript, quickResponse, callSid);
        this.cacheService.updateConversationContext(callSid, transcript, quickResponse);
        
        // Cancel ongoing OpenAI streaming for ultra-fast responses
        return;
      }

      // Wait for OpenAI completion with conversation history update
      try {
        const finalResponse = await openaiPromise;
        
        // Update conversation history efficiently
        if (callSession && finalResponse) {
          callSession.conversationHistory = callSession.conversationHistory || [];
          callSession.conversationHistory.push(
            { role: 'user', content: transcript },
            { role: 'assistant', content: finalResponse }
          );
          
          // Keep only last 6 exchanges for performance
          if (callSession.conversationHistory.length > 12) {
            callSession.conversationHistory = callSession.conversationHistory.slice(-12);
          }
        }
        
        // Process any remaining text chunks
        const finalSentences = this.extractStreamingSentences(finalResponse);
        const remainingSentences = finalSentences.filter(s => 
          !textChunks.some(tc => tc.text === s) && s.trim().length >= CONFIG.TEXT_CHUNK_MIN_LENGTH
        );
        
        // Generate TTS for remaining content in parallel
        const remainingPromises = remainingSentences.map(sentence => 
          this.generateAndStreamAudioChunkParallel(callSid, {
            text: sentence,
            index: audioChunkIndex++,
            timestamp: Date.now()
          }).then(audioChunk => {
            if (audioChunk) {
              this.forwardAudioChunkToStream(callSid, audioChunk);
            }
          })
        );
        
        await Promise.all(remainingPromises);
        
        // Cache the final response for future use
        this.cacheService.cacheResponseAndAudio(transcript, finalResponse, callSid);
        this.cacheService.updateConversationContext(callSid, transcript, finalResponse);
        
        logger.info('Parallel streaming pipeline completed', {
          callSid,
          totalTime: Date.now() - streamStart,
          textChunks: textChunks.length,
          audioChunks: audioQueue.length,
          wordCount,
          cached: true
        });
        
        // Record streaming pipeline performance
        this.performanceMonitor.recordResponseMetrics(callSid, {
          totalLatency: Date.now() - streamStart,
          responseType: 'streaming',
          cacheHit: false,
          textLength: finalResponse?.length || 0,
          chunkCount: textChunks.length,
          audioSize: audioQueue.reduce((total, chunk) => total + (chunk?.audio?.length || 0), 0)
        });
        
      } catch (error) {
        logger.error('OpenAI streaming failed', { callSid, error: error.message });
        // Fallback to cached response
        await this.sendCachedResponse(callSid, transcript);
      }

    } catch (error) {
      logger.error('Parallel streaming pipeline failed', {
        callSid,
        error: error.message,
        elapsed: Date.now() - streamStart
      });
      
      // Fallback to cached response
      await this.sendCachedResponse(callSid, transcript);
    }
  }

  /**
   * Start parallel TTS generation and audio streaming
   */
  async startParallelTTSPipeline(callSid, textChunks, initialBuffer) {
    const streamState = this.activeStreams.get(callSid);
    if (!streamState || !streamState.isActive) return;

    logger.info('Starting parallel TTS pipeline', {
      callSid,
      initialBufferLength: initialBuffer.length
    });

    // Create audio streaming URL for this call
    const baseUrl = process.env.NGROK_URL || `http://localhost:${process.env.PORT || 3000}`;
    const streamingUrl = `${baseUrl}/api/audio/stream/${callSid}`;
    
    // Start audio playback immediately (will stream chunks as they arrive)
    await this.startAudioStreaming(callSid, streamingUrl);

    // Process text chunks in parallel as they arrive
    let chunkIndex = 0;
    const processedChunks = new Set();

    // Process initial buffer
    if (initialBuffer.length >= 10) {
      this.generateAndStreamAudioChunk(callSid, initialBuffer, chunkIndex++);
    }

    // Monitor for new text chunks
    const chunkProcessor = setInterval(() => {
      const currentBuffer = streamState.textBuffer;
      
      // Find sentence boundaries for natural audio chunks
      const sentences = this.extractCompleteSentences(currentBuffer);
      
      sentences.forEach((sentence, index) => {
        const chunkKey = `${chunkIndex}-${sentence}`;
        if (!processedChunks.has(chunkKey) && sentence.trim().length > 5) {
          processedChunks.add(chunkKey);
          this.generateAndStreamAudioChunk(callSid, sentence, chunkIndex++);
        }
      });

      // Stop if stream is complete
      if (!streamState.isActive || chunkIndex > 20) {
        clearInterval(chunkProcessor);
      }
    }, 50); // Check every 50ms for new chunks

    // Cleanup after 10 seconds max
    setTimeout(() => {
      clearInterval(chunkProcessor);
      if (streamState) streamState.isActive = false;
    }, 10000);
  }

  /**
   * Generate audio chunk and stream to Twilio immediately
   */
  async generateAndStreamAudioChunk(callSid, text, chunkIndex) {
    const chunkStart = Date.now();
    
    try {
      logger.info('Generating audio chunk', {
        callSid,
        chunkIndex,
        textLength: text.length,
        textPreview: text.substring(0, 30)
      });

      // Generate audio with ElevenLabs streaming
      const audioResult = await this.elevenLabsService.generateStreamingSpeech(
        text,
        null,
        (audioChunk) => {
          // Stream each audio chunk immediately to the audio buffer
          this.bufferAudioChunk(callSid, audioChunk, chunkIndex);
        }
      );

      if (audioResult.success) {
        const latency = Date.now() - chunkStart;
        logger.info('Audio chunk generated and buffered', {
          callSid,
          chunkIndex,
          latency,
          audioSize: audioResult.audioBuffer.length
        });

        // Update metrics
        const metrics = this.streamMetrics.get(callSid);
        if (metrics) {
          metrics.textToSpeechLatency.push(latency);
        }
      }

    } catch (error) {
      logger.error('Audio chunk generation failed', {
        callSid,
        chunkIndex,
        error: error.message
      });
    }
  }

  /**
   * Buffer audio chunks for streaming playback
   */
  bufferAudioChunk(callSid, audioChunk, chunkIndex) {
    const buffer = this.audioChunkBuffer.get(callSid);
    if (buffer) {
      buffer.push({
        chunk: audioChunk,
        index: chunkIndex,
        timestamp: Date.now()
      });

      // Notify audio streaming endpoint that new chunk is available
      this.notifyAudioStreamingEndpoint(callSid);
    }
  }

  /**
   * Start audio streaming to Twilio
   */
  async startAudioStreaming(callSid, streamingUrl) {
    try {
      // Tell Twilio to start playing from our streaming endpoint
      const twiml = `<Response><Play>${streamingUrl}</Play><Pause length="3600"/></Response>`;
      
      await this.twilioService.client.calls(callSid).update({ twiml });
      
      logger.info('Audio streaming started', { callSid, streamingUrl });
      
    } catch (error) {
      logger.error('Failed to start audio streaming', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Extract complete sentences for natural audio chunking
   */
  extractCompleteSentences(text) {
    if (!text || text.length < 5) return [];
    
    // Split on sentence boundaries
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Return sentences that are complete enough to generate audio
    return sentences.filter(sentence => sentence.trim().length >= 5);
  }

  /**
   * Extract word-boundary chunks for ultra-fast streaming
   */
  extractWordBoundaryChunks(text) {
    if (!text || text.length < CONFIG.TEXT_CHUNK_MIN_LENGTH) return [];
    
    const chunks = [];
    const words = text.trim().split(/\s+/);
    
    // Create chunks of WORD_CHUNK_THRESHOLD words
    for (let i = 0; i < words.length; i += CONFIG.WORD_CHUNK_THRESHOLD) {
      const wordChunk = words.slice(i, i + CONFIG.WORD_CHUNK_THRESHOLD).join(' ');
      
      if (wordChunk.trim().length >= CONFIG.TEXT_CHUNK_MIN_LENGTH) {
        chunks.push(wordChunk.trim());
      }
    }
    
    // If we have remaining words that didn't make a full chunk, add them
    const remainder = words.length % CONFIG.WORD_CHUNK_THRESHOLD;
    if (remainder > 0 && words.length > CONFIG.WORD_CHUNK_THRESHOLD) {
      const lastChunk = words.slice(-remainder).join(' ');
      if (lastChunk.trim().length >= CONFIG.TEXT_CHUNK_MIN_LENGTH) {
        chunks.push(lastChunk.trim());
      }
    }
    
    logger.debug('Word-boundary chunks extracted', {
      originalLength: text.length,
      wordCount: words.length,
      chunkCount: chunks.length,
      chunkThreshold: CONFIG.WORD_CHUNK_THRESHOLD
    });
    
    return chunks;
  }

  /**
   * Extract streaming sentences optimized for real-time processing
   */
  extractStreamingSentences(text) {
    if (!text || text.length < CONFIG.TEXT_CHUNK_MIN_LENGTH) return [];
    
    // Enhanced sentence boundary detection for streaming
    const sentences = [];
    
    // Split by strong punctuation first
    const strongParts = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    strongParts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length >= CONFIG.TEXT_CHUNK_MIN_LENGTH) {
        sentences.push(trimmed);
      } else if (trimmed.length >= 3) {
        // Handle shorter phrases by combining or splitting on commas
        const subParts = trimmed.split(/,+/).filter(s => s.trim().length > 0);
        subParts.forEach(subPart => {
          if (subPart.trim().length >= CONFIG.TEXT_CHUNK_MIN_LENGTH) {
            sentences.push(subPart.trim());
          }
        });
      }
    });
    
    return sentences;
  }

  /**
   * Initialize audio streaming endpoint immediately
   */
  async initializeAudioStream(callSid) {
    try {
      const baseUrl = process.env.NGROK_URL || `http://localhost:${process.env.PORT || 3000}`;
      const streamingUrl = `${baseUrl}/api/audio/realtime/${callSid}`;
      
      // Start audio playback immediately with real-time endpoint
      const twiml = `<Response><Play loop="1">${streamingUrl}</Play><Pause length="3600"/></Response>`;
      
      await this.twilioService.client.calls(callSid).update({ twiml });
      
      logger.info('Real-time audio streaming initialized', { callSid, streamingUrl });
      
      return streamingUrl;
      
    } catch (error) {
      logger.error('Failed to initialize real-time audio stream', {
        callSid,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Generate audio chunk in parallel with immediate streaming
   */
  async generateAndStreamAudioChunkParallel(callSid, textChunk) {
    const chunkStart = Date.now();
    
    try {
      logger.info('Generating parallel audio chunk', {
        callSid,
        chunkIndex: textChunk.index,
        textLength: textChunk.text.length,
        priority: textChunk.priority || 'normal',
        textPreview: textChunk.text.substring(0, 30)
      });

      // Use streaming TTS for immediate audio chunk delivery
      const audioChunks = [];
      
      const audioResult = await this.elevenLabsService.generateStreamingSpeech(
        textChunk.text,
        null,
        (audioChunk) => {
          // Immediately forward each audio chunk to the stream
          audioChunks.push(audioChunk);
          
          const streamChunk = {
            audio: audioChunk,
            index: textChunk.index,
            subIndex: audioChunks.length - 1,
            timestamp: Date.now(),
            textPreview: textChunk.text.substring(0, 20)
          };
          
          // Forward immediately to real-time streaming
          this.forwardAudioChunkToStream(callSid, streamChunk);
        }
      );

      if (audioResult.success) {
        const latency = Date.now() - chunkStart;
        
        const audioChunk = {
          audio: audioResult.audioBuffer,
          text: textChunk.text,
          index: textChunk.index,
          timestamp: Date.now(),
          latency,
          chunksCount: audioChunks.length,
          priority: textChunk.priority || 'normal'
        };

        logger.info('Parallel audio chunk completed', {
          callSid,
          chunkIndex: textChunk.index,
          latency,
          audioSize: audioResult.audioBuffer.length,
          streamChunks: audioChunks.length
        });

        // Update metrics
        const metrics = this.streamMetrics.get(callSid);
        if (metrics) {
          metrics.textToSpeechLatency.push(latency);
        }

        return audioChunk;
      }

      return null;

    } catch (error) {
      logger.error('Parallel audio chunk generation failed', {
        callSid,
        chunkIndex: textChunk.index,
        error: error.message,
        text: textChunk.text.substring(0, 30)
      });
      return null;
    }
  }

  /**
   * Forward audio chunk immediately to real-time streaming endpoint
   */
  forwardAudioChunkToStream(callSid, audioChunk) {
    try {
      // Add to real-time buffer for immediate streaming
      const buffer = this.audioChunkBuffer.get(callSid);
      if (buffer) {
        buffer.push({
          chunk: audioChunk.audio,
          index: audioChunk.index,
          subIndex: audioChunk.subIndex || 0,
          timestamp: audioChunk.timestamp,
          priority: audioChunk.priority || 'normal'
        });

        // Sort by index and subIndex for proper playback order
        buffer.sort((a, b) => {
          if (a.index !== b.index) return a.index - b.index;
          return (a.subIndex || 0) - (b.subIndex || 0);
        });

        logger.debug('Audio chunk forwarded to real-time stream', {
          callSid,
          chunkIndex: audioChunk.index,
          subIndex: audioChunk.subIndex || 0,
          bufferSize: buffer.length
        });

        // Trigger immediate streaming notification
        this.notifyRealTimeStreamingEndpoint(callSid);
      }
    } catch (error) {
      logger.error('Failed to forward audio chunk to stream', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Check for ultra-high priority instant responses (< 10ms)
   */
  async checkUltraHighPriorityResponse(transcript, callSid) {
    try {
      const lowerTranscript = transcript.toLowerCase().trim();
      
      // Ultra-high priority patterns for instant responses
      const ultraHighPriorityResponses = {
        'hello': "Hello! Welcome to Sha Intelligence. How can I help you today?",
        'hi': "Hello! Welcome to Sha Intelligence. How can I help you today?",
        'hey': "Hello! Welcome to Sha Intelligence. How can I help you today?",
        'good morning': "Good morning! Welcome to Sha Intelligence. How can I help you today?",
        'good afternoon': "Good afternoon! Welcome to Sha Intelligence. How can I help you today?",
        'good evening': "Good evening! Welcome to Sha Intelligence. How can I help you today?",
        'yes': "Perfect! What would you like to know more about?",
        'yeah': "Perfect! What would you like to know more about?",
        'yep': "Perfect! What would you like to know more about?",
        'correct': "Perfect! What would you like to know more about?",
        'right': "Perfect! What would you like to know more about?",
        'exactly': "Perfect! What would you like to know more about?",
        'no': "No problem. What else can I help you with?",
        'nope': "No problem. What else can I help you with?",
        'not really': "No problem. What else can I help you with?",
        'negative': "No problem. What else can I help you with?",
        'okay': "Great! What other questions do you have?",
        'ok': "Great! What other questions do you have?",
        'alright': "Great! What other questions do you have?",
        'got it': "Great! What other questions do you have?",
        'understood': "Great! What other questions do you have?",
        'thanks': "You're welcome! What else would you like to know about Sha Intelligence?",
        'thank you': "You're welcome! What else would you like to know about Sha Intelligence?",
        'appreciate it': "You're welcome! What else would you like to know about Sha Intelligence?",
        'cheers': "You're welcome! What else would you like to know about Sha Intelligence?",
        'help': "I'm here to help! What would you like to know about Sha Intelligence?",
        'assist': "I'm here to help! What would you like to know about Sha Intelligence?",
        'support': "I'm here to help! What would you like to know about Sha Intelligence?",
        'need help': "I'm here to help! What would you like to know about Sha Intelligence?"
      };

      // Check for exact matches first (fastest path)
      if (ultraHighPriorityResponses[lowerTranscript]) {
        logger.info('Ultra-high priority exact match found', { 
          callSid, 
          pattern: lowerTranscript,
          responseTime: '< 5ms'
        });
        return ultraHighPriorityResponses[lowerTranscript];
      }

      // Check for partial matches in longer phrases (still very fast)
      for (const [pattern, response] of Object.entries(ultraHighPriorityResponses)) {
        if (lowerTranscript.includes(pattern)) {
          logger.info('Ultra-high priority partial match found', { 
            callSid, 
            pattern,
            responseTime: '< 10ms'
          });
          return response;
        }
      }

      return null;
    } catch (error) {
      logger.error('Ultra-high priority response check failed', {
        callSid,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Check for instant quick responses
   */
  async checkQuickResponse(transcript, callSid) {
    try {
      const lowerTranscript = transcript.toLowerCase().trim();
      
      // Expanded quick response patterns for instant feedback
      const quickResponses = {
        'hello': "Hello! Welcome to Sha Intelligence. How can I help you today?",
        'hi': "Hi there! Thanks for calling. What can I help you with?",
        'yes': "Great! What would you like to know?",
        'no': "No problem. What else can I help you with?",
        'okay': "Perfect. What other questions do you have?",
        'thanks': "You're welcome! What else would you like to know?",
        'thank you': "My pleasure! How else can I assist you?",
        'good': "Excellent! What would you like to learn about?",
        'great': "Wonderful! What information can I provide?",
        'help': "I'm here to help! What would you like to know about Sha Intelligence?",
        'about': "Sha Intelligence builds safe, secure, and privacy-first AI systems. What specific aspect interests you?",
        'services': "We offer AI solutions including Signal AI for telcos and custom deployments. What area interests you most?"
      };

      // Check for exact matches first
      if (quickResponses[lowerTranscript]) {
        logger.info('Quick response match found', { 
          callSid, 
          pattern: lowerTranscript,
          responseTime: '< 10ms'
        });
        return quickResponses[lowerTranscript];
      }

      // Check for partial matches in longer phrases
      for (const [pattern, response] of Object.entries(quickResponses)) {
        if (lowerTranscript.includes(pattern)) {
          logger.info('Quick response partial match found', { 
            callSid, 
            pattern,
            responseTime: '< 20ms'
          });
          return response;
        }
      }

      return null;
    } catch (error) {
      logger.error('Quick response check failed', {
        callSid,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Notify real-time streaming endpoint of new audio chunks
   */
  notifyRealTimeStreamingEndpoint(callSid) {
    // This could use WebSockets, Server-Sent Events, or polling optimization
    // For now, we rely on optimized polling in the streaming endpoint
    
    const streamState = this.activeStreams.get(callSid);
    if (streamState) {
      streamState.lastChunkTime = Date.now();
      streamState.hasNewChunks = true;
    }
  }

  /**
   * Send cached response for immediate fallback
   */
  async sendCachedResponse(callSid, transcript) {
    const quickResponses = {
      'hello': "Hello! Welcome to Sha Intelligence. How can I help you today?",
      'hi': "Hi there! Thanks for calling. What can I help you with?",
      'yes': "Great! What would you like to know?",
      'no': "No problem. Anything else I can help with?",
      'thanks': "You're welcome! What else can I help you with?"
    };

    const lowerTranscript = transcript.toLowerCase().trim();
    const cachedResponse = quickResponses[lowerTranscript] || 
      "I'd be happy to help you. What would you like to know about our AI services?";

    logger.info('Using cached response for instant delivery', {
      callSid,
      transcript: lowerTranscript,
      cachedResponse: cachedResponse.substring(0, 50)
    });

    // Generate and send cached response immediately
    const audioResult = await this.elevenLabsService.generateSpeech(cachedResponse);
    
    if (audioResult.success) {
      const encodedAudio = Buffer.from(audioResult.audioBuffer).toString('base64');
      const baseUrl = process.env.NGROK_URL || `http://localhost:${process.env.PORT || 3000}`;
      const audioUrl = `${baseUrl}/api/audio/cached?audio=${encodedAudio}`;
      
      await this.twilioService.playAudioToCustomer(callSid, audioUrl);
    } else {
      // Final fallback to Twilio TTS
      await this.twilioService.speakToCustomer(callSid, cachedResponse);
    }
  }

  /**
   * Notify streaming endpoint of new audio chunks
   */
  notifyAudioStreamingEndpoint(callSid) {
    // This would trigger the streaming endpoint to check for new chunks
    // Implementation depends on how you want to handle real-time notifications
    // Could use WebSockets, Server-Sent Events, or polling
  }

  /**
   * Get next audio chunk for streaming endpoint
   */
  getNextAudioChunk(callSid) {
    const buffer = this.audioChunkBuffer.get(callSid);
    const streamState = this.activeStreams.get(callSid);
    
    if (!buffer || !streamState) return null;

    // Return next unstreamed chunk
    if (streamState.currentAudioIndex < buffer.length) {
      const chunk = buffer[streamState.currentAudioIndex];
      streamState.currentAudioIndex++;
      return chunk;
    }

    return null;
  }

  /**
   * Cleanup streaming resources
   */
  cleanupStream(callSid) {
    const streamState = this.activeStreams.get(callSid);
    if (streamState) {
      streamState.isActive = false;
    }

    // Log final metrics
    const metrics = this.streamMetrics.get(callSid);
    if (metrics) {
      const avgTTSLatency = metrics.textToSpeechLatency.length > 0 ?
        metrics.textToSpeechLatency.reduce((a, b) => a + b) / metrics.textToSpeechLatency.length : 0;
      
      logger.info('Streaming pipeline completed', {
        callSid,
        averageTTSLatency: avgTTSLatency,
        totalChunks: metrics.textToSpeechLatency.length,
        totalTime: Date.now() - streamState?.startTime
      });
    }

    // Cleanup maps
    this.activeStreams.delete(callSid);
    this.audioChunkBuffer.delete(callSid);
    this.streamMetrics.delete(callSid);
    
    // Update active streams count for performance monitoring
    this.performanceMonitor.updateActiveStreams(this.activeStreams.size);
    
    // Clear session metrics from performance monitor
    this.performanceMonitor.clearSessionMetrics(callSid);
  }

  /**
   * Check if stream is active
   */
  isStreamActive(callSid) {
    const streamState = this.activeStreams.get(callSid);
    return streamState?.isActive || false;
  }

  /**
   * Record processing failure for error recovery
   */
  recordProcessingFailure(error) {
    this.errorRecovery.consecutiveFailures++;
    this.errorRecovery.lastFailureTime = Date.now();
    
    // Enable degraded mode after threshold
    if (this.errorRecovery.consecutiveFailures >= 3) {
      this.errorRecovery.degradedMode = true;
      logger.warn('Enabling degraded mode due to consecutive failures', {
        consecutiveFailures: this.errorRecovery.consecutiveFailures,
        error: error.message
      });
    }
  }

  /**
   * Record successful processing for error recovery
   */
  recordProcessingSuccess() {
    // Reset error recovery on successful processing
    if (this.errorRecovery.consecutiveFailures > 0) {
      logger.info('Resetting error recovery after successful processing', {
        previousFailures: this.errorRecovery.consecutiveFailures
      });
    }
    
    this.errorRecovery.consecutiveFailures = 0;
    this.errorRecovery.degradedMode = false;
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    return {
      ...this.healthStatus,
      errorRecovery: this.errorRecovery,
      activeStreams: this.activeStreams.size,
      memoryUsage: process.memoryUsage(),
      circuitBreakers: this.circuitBreakerService.getGlobalMetrics()
    };
  }

  /**
   * Check if customer is speaking (for interruption)
   */
  isCustomerSpeaking(callSid) {
    const callSession = CallSessionManager.getCallSession(callSid);
    return callSession?.isSpeaking || false;
  }

  /**
   * Enhanced customer speech interruption handling
   */
  handleInterruption(callSid, interruptionData = {}) {
    const streamState = this.activeStreams.get(callSid);
    if (!streamState) return;

    const interruptionTime = Date.now();
    const streamDuration = interruptionTime - streamState.startTime;
    
    // Store interruption state for potential resumption
    const interruptionState = {
      timestamp: interruptionTime,
      streamDuration,
      currentAudioIndex: streamState.currentAudioIndex,
      bufferedChunks: this.audioChunkBuffer.get(callSid)?.length || 0,
      interruptionType: interruptionData.type || 'speech_detected',
      confidence: interruptionData.confidence || 0.8,
      canResume: streamDuration > 1000 && streamState.textBuffer?.length > 0
    };

    // Gracefully stop active streaming
    streamState.isActive = false;
    streamState.interruptedAt = interruptionTime;
    streamState.interruptionState = interruptionState;

    // Clear any pending audio chunks if interruption is confident
    if (interruptionData.confidence > 0.9) {
      const audioBuffer = this.audioChunkBuffer.get(callSid);
      if (audioBuffer) {
        // Keep only the currently playing chunk
        const currentChunk = audioBuffer[streamState.currentAudioIndex];
        this.audioChunkBuffer.set(callSid, currentChunk ? [currentChunk] : []);
      }
    }

    logger.info('Enhanced streaming interruption handled', {
      callSid,
      interruptionType: interruptionState.interruptionType,
      confidence: interruptionState.confidence,
      streamDuration,
      canResume: interruptionState.canResume,
      bufferedChunks: interruptionState.bufferedChunks
    });

    // Record interruption metrics
    this.performanceMonitor?.recordStreamingMetrics?.(callSid, {
      interruptionLatency: streamDuration,
      interruptionType: interruptionState.interruptionType,
      confidence: interruptionState.confidence,
      error: false
    });

    return interruptionState;
  }

  /**
   * Resume streaming after interruption (if appropriate)
   */
  async resumeAfterInterruption(callSid, transcript) {
    const streamState = this.activeStreams.get(callSid);
    if (!streamState?.interruptionState) return false;

    const { interruptionState } = streamState;
    const timeSinceInterruption = Date.now() - interruptionState.timestamp;

    // Check if resumption is appropriate
    const shouldResume = 
      interruptionState.canResume &&
      timeSinceInterruption < 5000 && // Within 5 seconds
      transcript?.toLowerCase().includes('continue') ||
      transcript?.toLowerCase().includes('go on') ||
      transcript?.toLowerCase().includes('keep going');

    if (shouldResume) {
      logger.info('Resuming streaming after interruption', {
        callSid,
        timeSinceInterruption,
        originalText: streamState.textBuffer?.substring(0, 50)
      });

      // Resume from where we left off
      streamState.isActive = true;
      streamState.interruptedAt = null;
      streamState.interruptionState = null;

      // Continue with remaining text if any
      const remainingText = streamState.textBuffer;
      if (remainingText) {
        await this.processStreamingResponse(callSid, `Continue: ${remainingText}`);
      }

      return true;
    }

    return false;
  }

  /**
   * Smart interruption detection with confidence scoring
   */
  detectInterruption(callSid, audioData) {
    try {
      const streamState = this.activeStreams.get(callSid);
      if (!streamState?.isActive) return null;

      // Simple voice activity detection (in production, use more sophisticated VAD)
      const audioLevel = this.calculateAudioLevel(audioData);
      const speechThreshold = 0.3; // Configurable threshold
      
      if (audioLevel > speechThreshold) {
        const confidence = Math.min(audioLevel * 2, 1.0); // Scale to 0-1
        const sustainedSpeech = this.checkSustainedSpeech(callSid, audioLevel);
        
        return {
          type: 'speech_detected',
          confidence: sustainedSpeech ? confidence : confidence * 0.5,
          audioLevel,
          timestamp: Date.now(),
          shouldInterrupt: confidence > 0.6 && sustainedSpeech
        };
      }

      return null;
    } catch (error) {
      logger.error('Error detecting interruption', {
        callSid,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Calculate audio level for interruption detection
   */
  calculateAudioLevel(audioData) {
    if (!audioData || audioData.length === 0) return 0;

    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += Math.abs(audioData[i]);
    }
    
    return sum / audioData.length;
  }

  /**
   * Check for sustained speech to avoid false positives
   */
  checkSustainedSpeech(callSid, audioLevel) {
    const now = Date.now();
    const streamState = this.activeStreams.get(callSid);
    
    if (!streamState.speechHistory) {
      streamState.speechHistory = [];
    }

    // Add current audio level to history
    streamState.speechHistory.push({
      level: audioLevel,
      timestamp: now
    });

    // Keep only last 500ms of history
    streamState.speechHistory = streamState.speechHistory.filter(
      entry => now - entry.timestamp < 500
    );

    // Check if we have sustained speech above threshold
    const sustainedEntries = streamState.speechHistory.filter(
      entry => entry.level > 0.3
    );

    return sustainedEntries.length >= 3; // At least 3 samples above threshold
  }

  /**
   * Handle graceful stream termination
   */
  gracefulStreamTermination(callSid, reason = 'normal') {
    const streamState = this.activeStreams.get(callSid);
    if (!streamState) return;

    const terminationTime = Date.now();
    const streamDuration = terminationTime - streamState.startTime;

    logger.info('Graceful stream termination', {
      callSid,
      reason,
      streamDuration,
      chunksProcessed: streamState.currentAudioIndex,
      textLength: streamState.textBuffer?.length || 0
    });

    // Allow current chunk to complete if possible
    if (reason === 'interruption' && streamState.currentAudioIndex > 0) {
      setTimeout(() => {
        this.cleanupStream(callSid);
      }, 100); // Give 100ms for current chunk
    } else {
      this.cleanupStream(callSid);
    }

    // Record termination metrics
    this.performanceMonitor?.recordResponseMetrics?.(callSid, {
      totalLatency: streamDuration,
      responseType: 'terminated',
      terminationReason: reason,
      chunksCompleted: streamState.currentAudioIndex
    });
  }
}

export default StreamingPipelineService;