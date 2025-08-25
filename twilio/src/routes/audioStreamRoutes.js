import express from 'express';
import logger from '../services/LoggingService.js';
import StreamingPipelineService from '../services/StreamingPipelineService.js';

const router = express.Router();
const streamingPipeline = StreamingPipelineService.getInstance();

/**
 * Real-time audio streaming endpoint for Twilio
 * This endpoint streams audio chunks as they become available
 */
router.get('/stream/:callSid', async (req, res) => {
  const { callSid } = req.params;
  
  logger.info('Audio streaming request received', { 
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
    logger.info('Audio streaming client disconnected', {
      callSid,
      totalChunks,
      duration: Date.now() - streamStart
    });
  });

  req.on('error', (error) => {
    isStreaming = false;
    logger.error('Audio streaming error', {
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
            
            logger.debug('Audio chunk streamed', {
              callSid,
              chunkIndex: audioChunk.index,
              chunkSize: audioChunk.chunk.length,
              totalChunks
            });
            
          } catch (writeError) {
            logger.error('Error writing audio chunk', {
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
          logger.info('Stream marked as complete', { callSid });
          break;
        }

        // Safety timeout after 30 seconds
        if (Date.now() - streamStart > 30000) {
          logger.warn('Audio streaming timeout', { callSid });
          break;
        }
      }

      // End the stream
      res.end();
      
      logger.info('Audio streaming completed', {
        callSid,
        totalChunks,
        duration: Date.now() - streamStart
      });
    };

    await streamAudioChunks();

  } catch (error) {
    logger.error('Audio streaming failed', {
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