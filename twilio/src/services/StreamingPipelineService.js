import logger from './LoggingService.js';
import OpenAIService from './OpenAIService.js';
import ElevenLabsService from './ElevenLabsService.js';
import TwilioService from './TwilioService.js';
import CallSessionManager from './CallSessionManager.js';
import { CONFIG } from '../config/config.js';

class StreamingPipelineService {
  constructor() {
    this.openaiService = new OpenAIService();
    this.elevenLabsService = new ElevenLabsService();
    this.twilioService = new TwilioService();
    
    // Audio chunk management
    this.activeStreams = new Map();
    this.audioChunkBuffer = new Map();
    
    // Performance tracking
    this.streamMetrics = new Map();
  }

  // Singleton pattern to ensure shared state
  static getInstance() {
    if (!StreamingPipelineService.instance) {
      StreamingPipelineService.instance = new StreamingPipelineService();
    }
    return StreamingPipelineService.instance;
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
   * Process customer speech with zero-delay streaming response
   */
  async processStreamingResponse(callSid, transcript) {
    const streamStart = Date.now();
    const streamState = this.activeStreams.get(callSid);
    
    if (!streamState || !streamState.isActive) {
      logger.warn('Stream not active for call', { callSid });
      return;
    }

    const callSession = CallSessionManager.getCallSession(callSid);
    if (!callSession || callSession.isEnding) return;

    logger.info('Starting streaming response pipeline', {
      callSid,
      transcript: transcript.substring(0, 50),
      timestamp: streamStart
    });

    try {
      // Start streaming OpenAI response immediately
      let textChunks = [];
      let responseBuffer = '';
      let streamingComplete = false;
      
      // Create a promise that resolves when we have enough text to start TTS
      const firstChunkPromise = new Promise((resolve) => {
        let firstChunkSent = false;
        
        const processTextChunk = (chunk, fullResponse) => {
          textChunks.push(chunk);
          responseBuffer = fullResponse;
          
          // Update the stream state with current text
          const streamState = this.activeStreams.get(callSid);
          if (streamState) {
            streamState.textBuffer = fullResponse;
          }
          
          // Start TTS as soon as we have enough characters
          if (!firstChunkSent && responseBuffer.length >= CONFIG.TEXT_CHUNK_MIN_LENGTH) {
            firstChunkSent = true;
            resolve(responseBuffer);
          }
        };

        // Start streaming from OpenAI
        this.openaiService.generateStreamingResponse(
          transcript,
          callSession.conversationHistory?.slice(-6) || [],
          processTextChunk
        ).then(finalResponse => {
          streamingComplete = true;
          responseBuffer = finalResponse || responseBuffer;
          
          // Update conversation history
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
          
          logger.info('OpenAI streaming completed', { 
            callSid, 
            finalLength: finalResponse?.length || 0 
          });
        }).catch(error => {
          logger.error('OpenAI streaming failed', { callSid, error: error.message });
          streamingComplete = true;
          if (!firstChunkSent) resolve(null);
        });
      });

      // Wait for first chunk or timeout after 500ms
      const firstChunk = await Promise.race([
        firstChunkPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 500))
      ]);

      if (!firstChunk) {
        logger.warn('OpenAI streaming timeout, using cached response', { callSid });
        // Fallback to quick cached response
        return await this.sendCachedResponse(callSid, transcript);
      }

      // Start parallel TTS generation pipeline
      await this.startParallelTTSPipeline(callSid, textChunks, responseBuffer);

    } catch (error) {
      logger.error('Streaming response pipeline failed', {
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
  }

  /**
   * Check if stream is active
   */
  isStreamActive(callSid) {
    const streamState = this.activeStreams.get(callSid);
    return streamState?.isActive || false;
  }

  /**
   * Check if customer is speaking (for interruption)
   */
  isCustomerSpeaking(callSid) {
    const callSession = CallSessionManager.getCallSession(callSid);
    return callSession?.isSpeaking || false;
  }

  /**
   * Handle customer speech interruption
   */
  handleInterruption(callSid) {
    const streamState = this.activeStreams.get(callSid);
    if (streamState) {
      streamState.isActive = false;
      logger.info('Streaming response interrupted by customer speech', { callSid });
    }
  }
}

export default StreamingPipelineService;