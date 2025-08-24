// websocket.js - Updated to handle path-based parameters
import { WebSocketServer } from 'ws';
import { LiveTranscriptionEvents } from '@deepgram/sdk';
import url from 'url';
import { CONFIG } from './config/config.js';
import TwilioService from './services/TwilioService.js';
import DatabaseService from './services/DatabaseService.js';
import CallSessionManager from './services/CallSessionManager.js';
import logger from './services/LoggingService.js';
import {
  validateWebhookData,
  validatePhoneNumbers,
} from './utils/validation.js';
import qna from './nlp/secure-kb.js';
import OpenAIService from './services/OpenAIService.js';
import ElevenLabsService from './services/ElevenLabsService.js';

// Call ending detection patterns
const CALL_END_PATTERNS = [
  // Direct goodbye phrases
  /\b(goodbye|bye|see you|farewell|talk to you later|ttyl)\b/i,
  /\b(good bye|bye bye|see ya|catch you later)\b/i,

  // End call requests
  /\b(end the call|hang up|disconnect|finish the call)\b/i,
  /\b(that's all|i'm done|we're done|nothing else)\b/i,
  /\b(end this|stop the call|terminate)\b/i,

  // Thank you + ending context
  /\b(thank you.*bye|thanks.*goodbye|appreciate it.*done)\b/i,
  /\b(thank you.*that's all|thanks.*nothing else)\b/i,

  // Have a good day variations
  /\b(have a good day|have a nice day|good day|nice day)\b/i,
  /\b(have a great day|wonderful day|lovely day)\b/i,
];

// Validate environment variables
function validateEnvironmentVariables() {
  const missing = CONFIG.REQUIRED_ENV_VARS.filter(
    (varName) => !process.env[varName]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
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

// Helper function to detect call ending intent
function detectCallEndingIntent(transcript) {
  if (!transcript || typeof transcript !== 'string') return false;

  const cleanText = transcript.toLowerCase().trim();

  // Check direct patterns
  const hasEndingPattern = CALL_END_PATTERNS.some((pattern) =>
    pattern.test(cleanText)
  );

  if (hasEndingPattern) {
    logger.info('Call ending pattern detected', { transcript: cleanText });
    return true;
  }

  // Check for contextual endings (shorter phrases that might indicate ending)
  if (cleanText.length <= 15) {
    const shortEndingPhrases = [
      'bye',
      'goodbye',
      'thanks',
      'thank you',
      'done',
      'finish',
      'end',
      'stop',
      "that's it",
      'ok bye',
      'okay bye',
    ];

    return shortEndingPhrases.some(
      (phrase) => cleanText === phrase || cleanText.includes(phrase)
    );
  }

  return false;
}

// Generate appropriate goodbye response
async function generateGoodbyeResponse(transcript, callSid) {
  try {
    const callSession = CallSessionManager.getCallSession(callSid);
    const conversationHistory = callSession?.conversationHistory || [];

    // Predefined goodbye responses for quick delivery
    const quickGoodbyes = [
      "Thank you for calling! Have a wonderful day and don't hesitate to reach out if you need anything else.",
      'It was great talking with you! Take care and have an excellent day ahead.',
      'Thanks for your time today! Feel free to contact us anytime. Have a great day!',
      'Thank you for reaching out! Wishing you a fantastic day ahead.',
      "Great chatting with you! Take care and don't hesitate to call again if you need help.",
    ];

    // Use OpenAI for personalized goodbye if we have conversation context
    if (conversationHistory.length > 2) {
      try {
        const goodbyePrompt = `Based on our conversation, generate a brief, warm goodbye response (max 25 words) that acknowledges what we discussed. Customer said: "${transcript}"`;

        const response = await openaiService.generateResponse(
          goodbyePrompt,
          conversationHistory.slice(-4)
        );

        if (response?.response && response.response.length < 200) {
          return response.response;
        }
      } catch (error) {
        logger.warn('OpenAI goodbye generation failed, using fallback', {
          callSid,
          error: error.message,
        });
      }
    }

    // Fallback to quick predefined responses
    return quickGoodbyes[Math.floor(Math.random() * quickGoodbyes.length)];
  } catch (error) {
    logger.error('Error generating goodbye response', {
      callSid,
      error: error.message,
    });
    return 'Thank you for calling! Have a great day!';
  }
}

// Initialize services
const twilioService = new TwilioService();
const openaiService = new OpenAIService();
const elevenLabsService = new ElevenLabsService();
const activeConnections = new Set();

// WebSocketServer with path-based parameter handling
export const initializeWebSocket = (server, deepgram) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    console.log('Native WebSocket connection');
    console.log('Request URL:', req.url);

    let callerNumber, receivingNumber;

    // Method 1: Extract from path-based URL format
    // Expected format: /api/calls/media-stream/FROM_NUMBER/TO_NUMBER
    const pathMatch = req.url.match(
      /\/api\/calls\/media-stream\/([^\/]+)\/([^\/]+)/
    );
    if (pathMatch) {
      callerNumber = decodeURIComponent(pathMatch[1]);
      receivingNumber = decodeURIComponent(pathMatch[2]);
      console.log(
        'Path extraction - From:',
        callerNumber,
        'To:',
        receivingNumber
      );
    }

    // Method 2: Fallback to query parameter extraction (if still present)
    if (!callerNumber || !receivingNumber) {
      const parsedUrl = url.parse(req.url, true);
      callerNumber = parsedUrl.query.From;
      receivingNumber = parsedUrl.query.To;

      if (callerNumber || receivingNumber) {
        console.log(
          'Query extraction - From:',
          callerNumber,
          'To:',
          receivingNumber
        );
      }
    }

    // Method 3: Regex extraction from any format
    if (!callerNumber || !receivingNumber) {
      const fromMatch = req.url.match(/From[=\/]([^&\/]+)/);
      const toMatch = req.url.match(/To[=\/]([^&\/]+)/);

      if (fromMatch) callerNumber = decodeURIComponent(fromMatch[1]);
      if (toMatch) receivingNumber = decodeURIComponent(toMatch[1]);

      if (callerNumber || receivingNumber) {
        console.log(
          'Regex extraction - From:',
          callerNumber,
          'To:',
          receivingNumber
        );
      }
    }

    // Method 4: Check if this is the base path (means path-based wasn't used)
    if (!callerNumber && req.url === '/api/calls/media-stream') {
      console.log('Base path detected - parameters should be in path format');
    }

    console.log(
      'Final parameters - From:',
      callerNumber,
      'To:',
      receivingNumber
    );

    if (!callerNumber || !receivingNumber) {
      console.log('Missing parameters. URL:', req.url);

      // Send helpful error message
      ws.send(
        JSON.stringify({
          error: 'Missing required parameters',
          expectedFormat: '/api/calls/media-stream/FROM_NUMBER/TO_NUMBER',
          receivedUrl: req.url,
          solution: 'Use path-based parameters instead of query parameters',
        })
      );
      ws.close();
      return;
    }

    // Validate it's the correct endpoint
    if (!req.url.includes('/api/calls/media-stream')) {
      console.log('Invalid WebSocket path:', req.url);
      ws.close();
      return;
    }

    const connectionId = `${callerNumber}-${receivingNumber}-${Date.now()}`;

    if (activeConnections.has(connectionId)) {
      console.log('Duplicate connection detected:', connectionId);
      ws.close();
      return;
    }

    activeConnections.add(connectionId);
    console.log('Connection established:', connectionId);

    ws.on('close', () => {
      activeConnections.delete(connectionId);
      console.log('Connection cleaned up:', connectionId);
    });

    ws.on('error', (error) => {
      activeConnections.delete(connectionId);
      console.log('Connection error:', connectionId, error.message);
    });

    const fullStreamUrl = `wss://${req.headers.host}${req.url}`;

    handleMediaStream(
      ws,
      deepgram,
      callerNumber,
      receivingNumber,
      fullStreamUrl
    );
  });
};

function handleMediaStream(
  ws,
  deepgram,
  callerNumber,
  receivingNumber,
  streamUrl
) {
  console.log(
    'handleMediaStream called for',
    callerNumber,
    '->',
    receivingNumber
  );
  logger.info('Media Stream Connected', { callerNumber, receivingNumber });

  let callSid = null;
  let streamSid = null;
  let callSession = null;
  let isCallActive = true;
  let startEventProcessed = false;

  const wsTimeout = setTimeout(() => {
    console.warn('WebSocket timeout for call', callSid, 'closing connection');
    isCallActive = false;
    ws.terminate();
  }, CONFIG.WEBSOCKET_TIMEOUT);

  ws.on('message', async (message) => {
    try {
      clearTimeout(wsTimeout);

      if (!isCallActive) return;

      const data = JSON.parse(message);
      validateWebhookData(data);

      switch (data.event) {
        case 'connected':
          logger.info('Stream Connected');
          break;

        case 'start':
          if (startEventProcessed) {
            console.log('Duplicate start event ignored');
            return;
          }

          startEventProcessed = true;
          callSid = data.start.callSid;
          streamSid = data.start.streamSid;

          console.log('Processing START event for call', callSid);

          if (CallSessionManager.getCallSession(callSid)) {
            console.log('Call session already exists');
            callSession = CallSessionManager.getCallSession(callSid);
            return;
          }

          validatePhoneNumbers(callerNumber, receivingNumber);

          logger.logCallEvent('started', callSid, {
            streamSid,
            callerNumber,
            receivingNumber,
          });

          callSession = CallSessionManager.createCallSession(
            callSid,
            streamSid,
            ws,
            callerNumber,
            receivingNumber,
            streamUrl
          );

          callSession.isReadyForEvents = true;
          callSession.isEnding = false;

          try {
            const deepgramConnection = await startTranscription(
              callSid,
              ws,
              deepgram
            );
            if (deepgramConnection && isCallActive) {
              CallSessionManager.setDeepgramConnection(
                callSid,
                deepgramConnection
              );
            }
          } catch (error) {
            logger.error('Error initializing Deepgram connection', {
              callSid,
              error: error.message,
            });
            isCallActive = false;
            ws.terminate();
          }
          break;

        case 'media':
          if (!callSid || !isCallActive || !startEventProcessed) return;

          callSession = CallSessionManager.getCallSession(callSid);

          if (
            !callSession ||
            !callSession.isReadyForEvents ||
            callSession.isEnding
          ) {
            console.log(
              `Session for ${callSid} is not ready or ending. Dropping media event.`
            );
            return;
          }

          if (!callSession?.startupComplete) return;

          if (callSession?.deepgramConnection?.getReadyState?.() === 1) {
            try {
              const audioBuffer = Buffer.from(data.media.payload, 'base64');
              callSession.deepgramConnection.send(audioBuffer);
              CallSessionManager.updateLastActivity(callSid);
            } catch (error) {
              logger.error('Error sending audio to Deepgram', {
                callSid,
                error: error.message,
              });
            }
          }
          break;

        case 'stop':
          console.log('STOP event received');
          isCallActive = false;
          logger.logCallEvent('stopped', callSid);

          //   if (callSid && callSession) {
          //     await logConversation(
          //       callSession.callerNumber,
          //       callSession.receivingNumber,
          //       callSession.startTime,
          //       callSession.transcripts
          //     );
          //     CallSessionManager.removeCallSession(callSid, 'completed');
          //   }
          break;
      }
    } catch (error) {
      logger.logError(error, { callSid, event: 'message_handling' });
    }
  });

  ws.on('close', async () => {
    console.log('WebSocket closed');
    isCallActive = false;
    clearTimeout(wsTimeout);

    // if (callSid && callSession) {
    //   await logConversation(
    //     callSession.callerNumber,
    //     callSession.receivingNumber,
    //     callSession.startTime,
    //     callSession.transcripts
    //   );
    //   CallSessionManager.removeCallSession(callSid, 'disconnected');
    // }
  });

  ws.on('error', (error) => {
    console.log('WebSocket error:', error.message);
    isCallActive = false;
    if (callSid) {
      CallSessionManager.removeCallSession(callSid, 'failed');
    }
  });
}

// All other functions remain the same...
async function startTranscription(callSid, ws, deepgram, retryCount = 0) {
  try {
    // FIXED: Use CONFIG values for optimized performance
    let deepgramConnection = deepgram.listen.live({
      model: CONFIG.DEEPGRAM_MODEL,
      language: CONFIG.DEEPGRAM_LANGUAGE,
      punctuate: true,
      smart_format: true,
      interim_results: false,
      encoding: 'mulaw',
      sample_rate: 8000,
      endpointing: CONFIG.DEEPGRAM_ENDPOINTING, // Now 300ms for faster response
    });

    let connectionReady = false;
    const STARTUP_DELAY = 1000; // Reduced from 3000ms to 1000ms

    return new Promise((resolve, reject) => {
      // Use config timeout value
      const connectionTimeout = setTimeout(() => {
        if (!connectionReady) {
          logger.error('Deepgram connection timeout', { callSid, retryCount });
          deepgramConnection.finish();
          reject(new Error('Deepgram connection timeout'));
        }
      }, CONFIG.DEEPGRAM_CONNECTION_TIMEOUT); // Now 8000ms

      deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
        logger.info('Deepgram Connected', { callSid });
        connectionReady = true;
        clearTimeout(connectionTimeout);

        setTimeout(() => {
          const callSession = CallSessionManager.getCallSession(callSid);
          if (callSession) {
            callSession.isTranscriptionReady = true;
            callSession.hasUserSpoken = false;
            callSession.startupComplete = true;
            logger.info('Transcription startup complete', { callSid });
          }
        }, STARTUP_DELAY); // Now 1000ms instead of 3000ms

        resolve(deepgramConnection);
      });

      deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
        logger.info('Deepgram Disconnected', { callSid });
        connectionReady = false;
        clearTimeout(connectionTimeout);
      });

      deepgramConnection.on(LiveTranscriptionEvents.Error, (error) => {
        logger.error('Deepgram Error Details', {
          callSid,
          error: error.message,
          type: error.type,
          reason: error.reason,
        });
        connectionReady = false;
        clearTimeout(connectionTimeout);
        reject(error);
      });

      // Enhanced transcript handling
      deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        try {
          const callSession = CallSessionManager.getCallSession(callSid);
          if (!callSession?.startupComplete || callSession?.isEnding) return;

          const transcript = data.channel?.alternatives?.[0];
          if (!transcript?.transcript || !data.is_final) return;

          const rawText = transcript.transcript.trim();
          const confidence = transcript.confidence || 0;

          // More lenient filtering
          if (rawText.length < 3) return;

          // Simpler complete thought detection
          const sanitizedText = sanitizeTranscript(rawText);
          if (callSession.lastProcessedTranscript === sanitizedText) return;

          if (!callSession.hasUserSpoken) {
            callSession.hasUserSpoken = true;
            logger.info('First valid user speech detected', {
              callSid,
              text: sanitizedText,
              confidence,
            });
          }

          callSession.lastProcessedTranscript = sanitizedText;
          callSession.lastTranscriptTime = Date.now();
          logger.logTranscript(callSid, sanitizedText, confidence);

          CallSessionManager.addTranscript(callSid, {
            text: sanitizedText,
            confidence: Math.round(confidence * 100),
          });

          handleCustomerSpeech(callSid, sanitizedText, confidence);
        } catch (error) {
          logger.error('Error processing transcript', {
            callSid,
            error: error.message,
          });
        }
      });
    });
  } catch (error) {
    logger.logError(error, {
      callSid,
      event: 'deepgram_connection_error',
      retryCount,
    });

    if (retryCount < CONFIG.MAX_DEEPGRAM_RETRIES) {
      // Use CONFIG retry attempts (now 2 instead of hardcoded 2)
      logger.info('Retrying Deepgram connection', {
        callSid,
        retryCount: retryCount + 1,
      });
      await new Promise(
        (resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY * (retryCount + 1)) // Use CONFIG.RETRY_DELAY (500ms)
      );
      return startTranscription(callSid, ws, deepgram, retryCount + 1);
    }

    throw error;
  }
}

// Helper functions remain the same...
function isCompleteThought(text) {
  if (!text || text.length < 5) return false;
  if (/[.!?]$/.test(text)) return true;

  const completePatterns = [
    /thank you/i,
    /hello/i,
    /goodbye/i,
    /yes$/i,
    /no$/i,
    /okay$/i,
    /alright$/i,
    /sure$/i,
  ];

  return (
    completePatterns.some((pattern) => pattern.test(text)) ||
    (text.length > 20 && !/\s\w{1,3}$/.test(text))
  );
}

// Enhanced customer speech handler with call ending
async function handleCustomerSpeech(callSid, transcript, confidence) {
  try {
    const callSession = CallSessionManager.getCallSession(callSid);
    if (!callSession?.hasUserSpoken || !callSession?.isTranscriptionReady)
      return;
    if (!transcript || transcript.trim().length < 3) return;

    const now = Date.now();
    if (
      callSession.lastResponseTime &&
      now - callSession.lastResponseTime < 500
    )
      return;

    callSession.lastResponseTime = now;

    // Check if customer wants to end the call
    const isEndingCall = detectCallEndingIntent(transcript);

    if (isEndingCall) {
      logger.info('Call ending detected', { callSid, transcript });

      // Generate and send goodbye response
      const goodbyeResponse = await generateGoodbyeResponse(
        transcript,
        callSid
      );

      logger.info('Sending goodbye response', {
        callSid,
        response: goodbyeResponse,
        originalTranscript: transcript,
      });

      // Send goodbye message
      await twilioService.speakAndHangup(callSid, goodbyeResponse);

      // Mark session for ending and schedule hangup
      callSession.isEnding = true;
      callSession.endingInitiatedAt = now;

      // Give time for goodbye message to play, then hang up
    //   setTimeout(async () => {
    //     try {
    //       await twilioService.hangupCall(callSid);
    //       logger.info('Call ended gracefully', { callSid });

    //       // Log the conversation before cleanup
    //       if (callSession) {
    //         // await logConversation(
    //         //   callSession.callerNumber,
    //         //   callSession.receivingNumber,
    //         //   callSession.startTime,
    //         //   callSession.transcripts
    //         // );
    //         CallSessionManager.removeCallSession(callSid, 'completed-goodbye');
    //       }
    //     } catch (error) {
    //       logger.error('Error ending call gracefully', {
    //         callSid,
    //         error: error.message,
    //       });
    //     }
    //   }, 4000); // Wait 4 seconds for goodbye message to complete

      return; // Don't process as regular conversation
    }

    // Regular conversation handling (existing logic)
    let response;
    if (confidence < CONFIG.CONFIDENCE_THRESHOLD) {
      response =
        "I'm sorry, I didn't quite catch that. Could you please repeat?";
    } else {
      const currentSession = CallSessionManager.getCallSession(callSid);
      if (!currentSession || currentSession.isEnding) return;
      response = await generateAdvancedResponse(
        transcript.toLowerCase(),
        callSid
      );
    }

    if (!response) return;

    logger.info('Sending response to customer', {
      callSid,
      responseLength: response.length,
      transcript,
    });
    await speakToCustomerEnhanced(callSid, response);
  } catch (error) {
    logger.error('Error handling customer speech', {
      callSid,
      error: error.message,
    });
  }
}

function isLikelySystemAudio(text) {
  const systemPhrases = [
    'hello welcome to our demo',
    'how can i assist you today',
    'please hold',
  ];
  const lowerText = text.toLowerCase();
  return systemPhrases.some(
    (phrase) => lowerText.includes(phrase) || phrase.includes(lowerText)
  );
}

function sanitizeTranscript(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?'-]/g, '')
    .substring(0, 500);
}

async function generateAdvancedResponse(transcript, callSid) {
  try {
    const callSession = CallSessionManager.getCallSession(callSid);
    const conversationHistory = callSession?.conversationHistory || [];

    // First try the legacy knowledge base for quick responses
    const lowerTranscript = transcript.toLowerCase();
    const legacyResult = await qna.getBestAnswer('en', lowerTranscript);

    // If legacy KB has high confidence, use it (faster response)
    if (
      legacyResult?.answer &&
      legacyResult.score > CONFIG.NLP_CONFIDENCE_THRESHOLD
    ) {
      logger.info('Using legacy KB response', {
        callSid,
        score: legacyResult.score,
        transcript: transcript.substring(0, 50),
      });
      return legacyResult.answer;
    }

    // Otherwise, use OpenAI for more intelligent responses
    logger.info('Using OpenAI for response generation', {
      callSid,
      transcript: transcript.substring(0, 50),
      historyLength: conversationHistory.length,
    });

    const openaiResult = await openaiService.generateResponse(
      transcript,
      conversationHistory
    );

    // Update conversation history
    if (callSession) {
      callSession.conversationHistory = callSession.conversationHistory || [];
      callSession.conversationHistory.push(
        { role: 'user', content: transcript },
        { role: 'assistant', content: openaiResult.response }
      );

      // Keep only last 10 exchanges (20 messages) for performance
      if (callSession.conversationHistory.length > 20) {
        callSession.conversationHistory =
          callSession.conversationHistory.slice(-20);
      }
    }

    return openaiResult.response;
  } catch (error) {
    logger.error('Error in advanced response generation', {
      callSid,
      error: error.message,
      transcript: transcript.substring(0, 50),
    });

    // Fallback to simple responses
    const fallbackResponses = [
      "I apologize, I'm having trouble processing that right now. Could you please rephrase your question?",
      "I'm experiencing some technical difficulties. Please try asking your question differently.",
      'Let me help you with that. You can reach us directly at info@shaintelligence.com for immediate assistance.',
    ];

    return fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
  }
}

async function speakToCustomerEnhanced(callSid, text) {
  try {
    const useElevenLabs = process.env.USE_ELEVENLABS_TTS === 'true';

    if (useElevenLabs) {
      logger.info('Using ElevenLabs TTS with dynamic audio hosting', {
        callSid,
        textLength: text.length,
      });

      // Create a dynamic audio URL for this specific text
      // We'll pass the text as a base64-encoded query parameter
      const encodedText = Buffer.from(text).toString('base64');
      const audioUrl = `${
        process.env.NGROK_URL || 'localhost:3001'
      }/api/audio/dynamic?text=${encodedText}`;

      logger.info('Playing ElevenLabs audio from dynamic endpoint', {
        callSid,
        audioUrl: audioUrl, // Log full URL
      });

      await twilioService.playAudioToCustomer(callSid, audioUrl);
    } else {
      // Use standard Twilio TTS
      logger.info('Using Twilio TTS fallback', { callSid });
      await twilioService.speakToCustomer(callSid, text);
    }
  } catch (error) {
    logger.error('Error in enhanced TTS', {
      callSid,
      error: error.message,
      textPreview: text.substring(0, 50),
    });

    // Final fallback to Twilio TTS
    await twilioService.speakToCustomer(callSid, text);
  }
}

// async function logConversation(callerNumber, receivingNumber, startTime, transcripts) {
//   if (!callerNumber || !receivingNumber || !transcripts?.length) return;

//   try {
//     await DatabaseService.logConversation(callerNumber, receivingNumber, startTime, transcripts);
//     logger.info('Conversation logged successfully', { callerNumber, receivingNumber });
//   } catch (error) {
//     logger.logError(error, { event: 'conversation_logging_failed', callerNumber, receivingNumber });
//   }
// }
