import { WebSocketServer } from 'ws';
import { LiveTranscriptionEvents } from '@deepgram/sdk';
import url from 'url';
import { CONFIG } from './config/config.js';
import TwilioService from './services/TwilioService.js';
import DatabaseService from './services/DatabaseService.js';
import CallSessionManager from './services/CallSessionManager.js';
import logger from './services/LoggingService.js';
import { validateWebhookData, sanitizeTranscript, validatePhoneNumbers } from './utils/validation.js';
import qna from './nlp/nlp-kb.js';

// Validate environment variables
function validateEnvironmentVariables() {
  const missing = CONFIG.REQUIRED_ENV_VARS.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize environment validation
try {
  validateEnvironmentVariables();
  logger.info('Environment validation successful');
} catch (error) {
  logger.error('Environment validation failed', { error: error.message });
  process.exit(1);
}

// Initialize services
const twilioService = new TwilioService();

// Remove global deepgramConnection - now managed per session

// The function to be exported and called from index.js
export const initializeWebSocket = (server, deepgram) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    if (req.url === '/api/calls/media-stream') {
      //   const params = new URLSearchParams(req.url.split('?')[1]);
      //   const callerNumber = params.get('From');
      //   const receivingNumber = params.get('To');

      const parsedUrl = url.parse(req.url, true);
      const callerNumber = parsedUrl.query.From;
      const receivingNumber = parsedUrl.query.To;

      handleMediaStream(
        ws,
        deepgram,
        callerNumber,
        receivingNumber
      );
    }
  });
};

function handleMediaStream(
  ws,
  deepgram,
  callerNumber,
  receivingNumber
) {
  logger.info('Media Stream Connected', { callerNumber, receivingNumber });
  let callSid = null;
  let streamSid = null;
  let callSession = null;

  // Set WebSocket timeout
  const wsTimeout = setTimeout(() => {
    console.warn(`WebSocket timeout for call ${callSid}, closing connection`);
    ws.terminate();
  }, CONFIG.WEBSOCKET_TIMEOUT);

  ws.on('message', async (message) => {
    try {
      // Reset timeout on activity
      clearTimeout(wsTimeout);
      const data = JSON.parse(message);

      // Validate incoming webhook data
      validateWebhookData(data);

      switch (data.event) {
        case 'connected':
          logger.info('Stream Connected');
          break;
        case 'start':
          callSid = data.start.callSid;
          streamSid = data.start.streamSid;
          
          // Validate phone numbers
          validatePhoneNumbers(callerNumber, receivingNumber);

          logger.logCallEvent('started', callSid, { streamSid, callerNumber, receivingNumber });

          callSession = CallSessionManager.createCallSession(
            callSid, 
            streamSid, 
            ws, 
            callerNumber, 
            receivingNumber
          );

          const deepgramConnection = await startTranscription(
            callSid,
            ws,
            deepgram
          );
          
          CallSessionManager.setDeepgramConnection(callSid, deepgramConnection);
          break;
        case 'media': // Send audio to Deepgram
          callSession = CallSessionManager.getCallSession(callSid);
          if (callSession && callSession.deepgramConnection) {
            const connection = callSession.deepgramConnection;
            if (typeof connection.getReadyState === 'function' && 
                connection.getReadyState() === 1) {
              try {
                const audioBuffer = Buffer.from(data.media.payload, 'base64');
                connection.send(audioBuffer);
                CallSessionManager.updateLastActivity(callSid);
              } catch (error) {
                logger.error('Error sending audio to Deepgram', { callSid, error: error.message });
              }
            }
          } else if (callSession && !callSession.deepgramConnection) {
            logger.warn('Deepgram connection is null, attempting to reconnect', { callSid });
            const newConnection = await startTranscription(callSid, ws, deepgram);
            CallSessionManager.setDeepgramConnection(callSid, newConnection);
          }
          break;
        case 'stop':
          logger.logCallEvent('stopped', callSid);
          if (callSession) {
            // Log conversation before cleanup
            await logConversation(
              callSession.callerNumber,
              callSession.receivingNumber,
              callSession.startTime,
              callSession.transcripts
            );
          }
          CallSessionManager.removeCallSession(callSid, 'completed');
          break;
        default:
          break;
      }
    } catch (error) {
      logger.logError(error, { callSid, event: 'message_handling' });
    }
  });

  ws.on('close', async () => {
    logger.info('WebSocket connection closed', { callSid });
    clearTimeout(wsTimeout);
    
    if (callSid) {
      callSession = CallSessionManager.getCallSession(callSid);
      if (callSession) {
        // Log the conversation before cleanup
        await logConversation(
          callSession.callerNumber,
          callSession.receivingNumber,
          callSession.startTime,
          callSession.transcripts
        );
        CallSessionManager.removeCallSession(callSid, 'disconnected');
      }
    }
  });

  ws.on('error', (error) => {
    logger.logError(error, { callSid, event: 'websocket_error' });
    if (callSid) {
      CallSessionManager.removeCallSession(callSid, 'failed');
    }
  });
}

async function startTranscription(callSid, ws, deepgram, retryCount = 0) {
  try {
    deepgramConnection = deepgram.listen.live({
      model: CONFIG.DEEPGRAM_MODEL,
      language: CONFIG.DEEPGRAM_LANGUAGE,
      smart_format: true,
      endpointing: CONFIG.DEEPGRAM_ENDPOINTING,
      punctuate: true,
      interim_results: true,
    });

    // Set up connection timeout
    const connectionTimeout = setTimeout(() => {
      if (deepgramConnection && deepgramConnection.getReadyState() !== 1) {
        console.warn('Deepgram connection timeout, retrying...');
        deepgramConnection.finish();
        retryDeepgramConnection(callSid, ws, deepgram, activeCalls, retryCount + 1);
      }
    }, CONFIG.DEEPGRAM_CONNECTION_TIMEOUT);

    // Connection events handler
    deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram Connected');
      clearTimeout(connectionTimeout);
    });

    deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram Disconnected');
      clearTimeout(connectionTimeout);
    });

    deepgramConnection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error('Deepgram Error:', error);
      clearTimeout(connectionTimeout);
      retryDeepgramConnection(callSid, ws, deepgram, activeCalls, retryCount + 1);
    });

    deepgramConnection.on(LiveTranscriptionEvents.Timeout, () => {
      console.warn('Deepgram Timeout');
      retryDeepgramConnection(callSid, ws, deepgram, activeCalls, retryCount + 1);
    });

    //handle transcription result
    deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0];

      if (transcript && transcript.transcript.trim()) {
        const sanitizedText = sanitizeTranscript(transcript.transcript);
        
        logger.logTranscript(callSid, sanitizedText, transcript.confidence);

        //store transcript
        CallSessionManager.addTranscript(callSid, {
          text: sanitizedText,
          confidence: transcript.confidence
        });

        //process speech and respond
        handleCustomerSpeech(
          callSid,
          sanitizedText,
          transcript.confidence
        );
      }
    });

    return deepgramConnection;
  } catch (error) {
    logger.logError(error, { callSid, event: 'deepgram_connection_error' });
    return retryDeepgramConnection(callSid, ws, deepgram, retryCount + 1);
  }
}

async function retryDeepgramConnection(callSid, ws, deepgram, retryCount) {
  if (retryCount >= CONFIG.MAX_DEEPGRAM_RETRIES) {
    logger.error('Max Deepgram retry attempts exceeded', { 
      callSid, 
      maxRetries: CONFIG.MAX_DEEPGRAM_RETRIES 
    });
    return null;
  }

  logger.info('Retrying Deepgram connection', { 
    callSid, 
    attempt: retryCount + 1, 
    maxRetries: CONFIG.MAX_DEEPGRAM_RETRIES 
  });
  
  return new Promise((resolve) => {
    setTimeout(async () => {
      const connection = await startTranscription(callSid, ws, deepgram, retryCount);
      resolve(connection);
    }, CONFIG.RETRY_DELAY * retryCount);
  });
}

async function handleCustomerSpeech(callSid, transcript, confidence) {
  logger.debug('Processing customer speech', { callSid, confidence });

  const callSession = CallSessionManager.getCallSession(callSid);
  if (!callSession) {
    logger.warn('No active call session found', { callSid });
    return;
  }

  // simple intent recognition
  let response = generateSimpleResponse(transcript.toLowerCase());

  // if confidence is low enough, ask for clarification
  if (confidence < CONFIG.CONFIDENCE_THRESHOLD) {
    response = "I'm sorry, I didn't quite catch that. Could you please repeat?";
  }

  // Send the response back to the client
  await twilioService.speakToCustomer(callSid, response);
}

//enhanced response generation to answer questions about sha Intelligence
// now uses nlp.js nlu model. Check src/nlp/README.md for more information
async function generateSimpleResponse(transcript) {
  logger.debug('Generating response for transcript', { transcript: transcript.substring(0, 50) });
  const lowerTranscript = transcript.toLowerCase();

  // First, check for simple greetings and farewells as these are common and
  // don't require the full knowledge base lookup.
  if (lowerTranscript.includes('hello')) {
    return 'Hi there! How can I assist you today?';
  } else if (lowerTranscript.includes('bye')) {
    return 'Goodbye! Have a great day!';
  } else if (lowerTranscript.includes('help')) {
    return 'Sure, I can help you with that. What do you need assistance with?';
  }

  const result = await qna.getBestAnswer('en', lowerTranscript);

  // If a good answer is found (confidence above a certain threshold), return it.
  if (result && result.answer && result.score > CONFIG.NLP_CONFIDENCE_THRESHOLD) {
    logger.debug('Knowledge base match found', { confidence: result.score });
    return result.answer;
  }

  logger.debug('No specific response found for transcript');
  return "I'm not sure how to respond to that. I'm still learning.";
}

// Legacy speakToCustomer function - now handled by TwilioService
// Keeping for reference but functionality moved to services

// Session creation now handled by CallSessionManager

// Log conversation using DatabaseService
async function logConversation(callerNumber, receivingNumber, startTime, transcripts) {
  if (!callerNumber || !receivingNumber || !transcripts || transcripts.length === 0) {
    logger.debug('Skipping conversation logging - missing required data');
    return;
  }

  try {
    await DatabaseService.logConversation(callerNumber, receivingNumber, startTime, transcripts);
    logger.info('Conversation logged successfully', { callerNumber, receivingNumber });
  } catch (error) {
    logger.logError(error, { 
      event: 'conversation_logging_failed', 
      callerNumber, 
      receivingNumber 
    });
  }
}
