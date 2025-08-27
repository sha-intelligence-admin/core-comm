import express from 'express';
import logger from '../services/LoggingService.js';
import StreamingPipelineService from '../services/StreamingPipelineService.js';

const router = express.Router();
const streamingPipeline = StreamingPipelineService.getInstance();

/**
 * Real-time audio streaming endpoint for Twilio (optimized for ultra-low latency)
 * This endpoint streams audio chunks as they become available with minimal buffering
 */
router.get('/realtime/:callSid', async (req, res) => {
  const { callSid } = req.params;
  
  logger.info('Real-time audio streaming request received', { 
    callSid,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Set headers for real-time audio streaming
  res.set({
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
    'Accept-Ranges': 'none',
    'Access-Control-Allow-Origin': '*'
  });

  let isStreaming = true;
  let totalChunks = 0;
  let totalBytes = 0;
  const streamStart = Date.now();
  let lastChunkTime = streamStart;

  // Handle client disconnect
  req.on('close', () => {
    isStreaming = false;
    logger.info('Real-time audio streaming client disconnected', {
      callSid,
      totalChunks,
      totalBytes,
      duration: Date.now() - streamStart,
      avgLatency: totalChunks > 0 ? (Date.now() - streamStart) / totalChunks : 0
    });
  });

  req.on('error', (error) => {
    isStreaming = false;
    logger.error('Real-time audio streaming error', {
      callSid,
      error: error.message
    });
  });

  try {
    // Ultra-fast real-time audio chunk streaming (optimized to 0.5ms)
    const streamRealTimeAudio = async () => {
      let consecutiveEmptyPolls = 0;
      let pollInterval = 0.5; // Start with 0.5ms polling for ultra-low latency
      let priorityChunksDetected = 0;
      
      while (isStreaming) {
        const audioChunk = streamingPipeline.getNextAudioChunk(callSid);
        
        if (audioChunk) {
          try {
            // Write audio chunk immediately to response stream
            const chunkBuffer = audioChunk.chunk;
            res.write(chunkBuffer);
            
            totalChunks++;
            totalBytes += chunkBuffer.length;
            lastChunkTime = Date.now();
            consecutiveEmptyPolls = 0;
            
            // Priority-based polling adjustment
            if (audioChunk.priority === 'ultra-high' || audioChunk.priority === 'high') {
              priorityChunksDetected++;
              pollInterval = 0.5; // Ultra-fast for priority chunks
            } else {
              pollInterval = Math.min(pollInterval * 1.1, 2); // Slightly increase for normal chunks
            }
            
            logger.debug('Real-time audio chunk streamed', {
              callSid,
              chunkIndex: audioChunk.index,
              subIndex: audioChunk.subIndex || 0,
              chunkSize: chunkBuffer.length,
              priority: audioChunk.priority || 'normal',
              totalChunks,
              latency: lastChunkTime - audioChunk.timestamp,
              pollInterval
            });
            
          } catch (writeError) {
            logger.error('Error writing real-time audio chunk', {
              callSid,
              error: writeError.message
            });
            break;
          }
        } else {
          // Enhanced adaptive polling with priority consideration
          consecutiveEmptyPolls++;
          
          if (priorityChunksDetected > 0) {
            // Keep ultra-low latency for calls with priority chunks
            pollInterval = Math.min(pollInterval + 0.1, 2); // Max 2ms for priority calls
          } else {
            // Standard adaptive polling
            if (consecutiveEmptyPolls > 20) {
              pollInterval = Math.min(pollInterval + 0.5, 5); // Max 5ms delay
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        // Check if we should continue streaming
        if (!streamingPipeline.isStreamActive(callSid)) {
          // Wait a bit longer for any final chunks
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const finalChunk = streamingPipeline.getNextAudioChunk(callSid);
          if (finalChunk) {
            res.write(finalChunk.chunk);
            totalChunks++;
          }
          
          logger.info('Real-time stream marked as complete', { callSid });
          break;
        }

        // Extended timeout for longer conversations
        if (Date.now() - streamStart > 60000) {
          logger.warn('Real-time audio streaming timeout', { 
            callSid,
            duration: Date.now() - streamStart 
          });
          break;
        }
      }

      // End the stream gracefully
      res.end();
      
      logger.info('Real-time audio streaming completed', {
        callSid,
        totalChunks,
        totalBytes,
        duration: Date.now() - streamStart,
        avgChunkSize: totalChunks > 0 ? totalBytes / totalChunks : 0,
        streamingRate: totalBytes / ((Date.now() - streamStart) / 1000) // bytes per second
      });
    };

    await streamRealTimeAudio();

  } catch (error) {
    logger.error('Real-time audio streaming failed', {
      callSid,
      error: error.message,
      totalChunks,
      totalBytes
    });
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Real-time streaming failed' });
    }
  }
});

/**
 * Legacy audio streaming endpoint (kept for backward compatibility)
 */
router.get('/stream/:callSid', async (req, res) => {
  const { callSid } = req.params;
  
  logger.info('Legacy audio streaming request received', { 
    callSid,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Set headers for audio streaming
  res.set({
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
    'Accept-Ranges': 'none'
  });

  let isStreaming = true;
  let totalChunks = 0;
  const streamStart = Date.now();

  // Handle client disconnect
  req.on('close', () => {
    isStreaming = false;
    logger.info('Legacy audio streaming client disconnected', {
      callSid,
      totalChunks,
      duration: Date.now() - streamStart
    });
  });

  req.on('error', (error) => {
    isStreaming = false;
    logger.error('Legacy audio streaming error', {
      callSid,
      error: error.message
    });
  });

  try {
    // Stream audio chunks as they become available
    const streamAudioChunks = async () => {
      while (isStreaming) {
        const audioChunk = streamingPipeline.getNextAudioChunk(callSid);
        
        if (audioChunk) {
          try {
            // Write audio chunk to response stream
            res.write(audioChunk.chunk);
            totalChunks++;
            
            logger.debug('Legacy audio chunk streamed', {
              callSid,
              chunkIndex: audioChunk.index,
              chunkSize: audioChunk.chunk.length,
              totalChunks
            });
            
          } catch (writeError) {
            logger.error('Error writing legacy audio chunk', {
              callSid,
              error: writeError.message
            });
            break;
          }
        } else {
          // No chunks available, wait briefly
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Check if we should continue streaming
        if (!streamingPipeline.isStreamActive(callSid)) {
          logger.info('Legacy stream marked as complete', { callSid });
          break;
        }

        // Safety timeout after 30 seconds
        if (Date.now() - streamStart > 30000) {
          logger.warn('Legacy audio streaming timeout', { callSid });
          break;
        }
      }

      // End the stream
      res.end();
      
      logger.info('Legacy audio streaming completed', {
        callSid,
        totalChunks,
        duration: Date.now() - streamStart
      });
    };

    await streamAudioChunks();

  } catch (error) {
    logger.error('Legacy audio streaming failed', {
      callSid,
      error: error.message,
      totalChunks
    });
    
    if (!res.headersSent) {
      res.status(500).end();
    }
  }
});

/**
 * Cached audio endpoint for instant responses
 */
router.get('/cached', async (req, res) => {
  const { audio } = req.query;
  
  if (!audio) {
    return res.status(400).json({ error: 'Audio parameter required' });
  }

  try {
    const audioBuffer = Buffer.from(audio, 'base64');
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(audioBuffer);
    
    logger.info('Cached audio served', {
      audioSize: audioBuffer.length
    });
    
  } catch (error) {
    logger.error('Error serving cached audio', {
      error: error.message
    });
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

/**
 * Dynamic audio endpoint (existing functionality)
 */
router.get('/dynamic', async (req, res) => {
  const { text } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'Text parameter required' });
  }

  try {
    const decodedText = Buffer.from(text, 'base64').toString('utf-8');
    logger.info('Generating dynamic audio', {
      textLength: decodedText.length,
      textPreview: decodedText.substring(0, 50)
    });

    const ElevenLabsService = (await import('../services/ElevenLabsService.js')).default;
    const elevenLabsService = new ElevenLabsService();
    
    const audioResult = await elevenLabsService.generateSpeech(decodedText);
    
    if (audioResult.success && audioResult.audioBuffer) {
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioResult.audioBuffer.length,
        'Cache-Control': 'no-cache'
      });
      
      res.send(audioResult.audioBuffer);
      
      logger.info('Dynamic audio generated and served', {
        textLength: decodedText.length,
        audioSize: audioResult.audioBuffer.length
      });
      
    } else {
      throw new Error(audioResult.error || 'Audio generation failed');
    }
    
  } catch (error) {
    logger.error('Error generating dynamic audio', {
      error: error.message,
      text: text?.substring(0, 50)
    });
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

/**
 * Status endpoint to check if audio chunks are available
 */
router.get('/stream-status/:callSid', (req, res) => {
  const { callSid } = req.params;
  
  try {
    const isActive = streamingPipeline.isStreamActive(callSid);
    const nextChunk = streamingPipeline.getNextAudioChunk(callSid);
    
    res.json({
      active: isActive,
      hasChunks: !!nextChunk,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error checking stream status', {
      callSid,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;