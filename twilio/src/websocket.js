import { WebSocketServer } from 'ws';
import twilio from 'twilio';
import { LiveTranscriptionEvents, LiveTTSEvents } from '@deepgram/sdk';
import { start } from 'repl';

let deepgramConnection = null;

// The function to be exported and called from server.js
export const initializeWebSocket = (server, deepgram, activeCalls) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    if (req.url === '/api/calls/media-stream') {
      handleMediaStream(ws, deepgram, activeCalls);
    }
  });
};

function handleMediaStream(ws, deepgram, activeCalls) {
  console.log('Media Stream Connected');
  let callSid = null;
  let streamSid = null; // This single handler correctly manages all incoming messages

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.event) {
        case 'connected':
          console.log('Stream Connected');
          break;
        case 'start':
          callSid = data.start.callSid; // Corrected to match Twilio payload
          streamSid = data.start.streamSid; // Corrected to match Twilio payload

          console.log(`Stream Started: ${streamSid} for call: ${callSid}`); // Store call session

          const newSession = createCallSession(callSid, streamSid, ws);
          activeCalls.set(callSid, newSession);

          deepgramConnection = await startTranscription(
            callSid,
            ws,
            deepgram,
            activeCalls
          );
          break;
        case 'media': // Send audio to Deepgram
          if (deepgramConnection && deepgramConnection.getReadyState() === 1) {
            const audioBuffer = Buffer.from(data.media.payload, 'base64');
            deepgramConnection.send(audioBuffer);
          }
          break;
        case 'stop':
          console.log(`Stopped media stream for Call SID: ${callSid}`);
          if (deepgramConnection) {
            deepgramConnection.finish();
          }
          activeCalls.delete(callSid);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling media stream:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (callSid) {
      activeCalls.delete(callSid);
    }
    if (deepgramConnection) {
      deepgramConnection.finish();
    }
  });
}

async function startTranscription(callSid, ws) {
  try {
    deepgramConnection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      endpointing: 300,
      punctuate: true,
      interim_results: true,
    });

    //handle transcription result
    deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0];

      if (transcript && transcript.transcript.trim()) {
        console.log('Caller Said:', transcript.transcript);
        console.log(
          'Confidentiality Level:',
          (transcript.confidence * 100).toFixed(1),
          '%'
        );

        //store transcript
        const callSession = activeCalls.get(callSid);
        if (callSession) {
          callSession.transcripts.push({
            text: transcript.transcript,
            confidence: transcript.confidence,
            time: new Date(),
          });
        }

        //process speech and respond
        handleCustomerSpeech(
          callSid,
          transcript.transcript,
          transcript.confidence
        );

        //connection events handler
        deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
          console.log('Deepgram Connected');
        });

        deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
          console.log('Deepgram Disconnected');
        });

        deepgramConnection.on(LiveTranscriptionEvents.Error, (error) => {
          console.error('Deepgram Error:', error);
        });

        deepgramConnection.on(LiveTranscriptionEvents.Timeout, () => {
          console.warn('Deepgram Timeout');
        });
      }
    });
  } catch (error) {
    console.error('Error starting Deepgram connection:', error);
  }
}

async function handleCustomerSpeech(callSid, transcript, confidence) {
  console.log(`Handling customer speech for Call SID: ${callSid}`);
  console.log(`Transcript: ${transcript}`);
  console.log(`Confidence: ${confidence}`);

  const callSession = activeCalls.get(callSid);
  if (!callSession) {
    console.log(`No active call session found for Call SID: ${callSid}`);
    return;
  }

  // simple intent recognition
  let response = generateSimpleResponse(transcript.toLowerCase());

  // if confidence is low enough, ask for clarification
  if (confidence < 0.7) {
    response = "I'm sorry, I didn't quite catch that. Could you please repeat?";
  }

  // Send the response back to the client
  await speakToCustomer(callSid, response);
}

//enhanced response generation to answer questions about sha Intelligence
function generateSimpleResponse(transcript) {
  console.log(`Generating simple response for transcript: ${transcript}`);
  const lowerTranscript = transcript.toLowerCase();

  if (lowerTranscript.includes('hello')) {
    return 'Hi there! How can I assist you today?';
  } else if (lowerTranscript.includes('bye')) {
    return 'Goodbye! Have a great day!';
  } else if (lowerTranscript.includes('help')) {
    return 'Sure, I can help you with that. What do you need assistance with?';
  } else if (lowerTranscript.includes('about')) {
    
    return 'Sha Intelligence builds safe, secure, and privacy-first AI systems by design to serve people, not exploit them.';
  } else if (lowerTranscript.includes('problem')) {
    return 'The problem is that most AI systems today overlook safety, privacy, and human alignment, which puts people and organizations at risk.';
  } else if (lowerTranscript.includes('solution')) {
    return 'The solution is to build decentralized AI systems that are safe, secure, and privacy-first. This puts people in control and aligns intelligence with human values.';
  } else if (lowerTranscript.includes('business model')) {
    return 'Our business model is a scalable B2B model that generates revenue through a multi-faceted approach, including a subscription-based model, enterprise licensing, and custom API deployments.';
  } else if (
    lowerTranscript.includes('revenue') ||
    lowerTranscript.includes('traction')
  ) {
    return 'So far, we have generated over $150,000 in revenue from pilot subscriptions and API access, specifically on Core Comm.';
  } else if (lowerTranscript.includes('market size')) {
    return 'According to Precedence Research, the market size for AI is projected to reach $3.68 trillion by 2034.';
  } else if (lowerTranscript.includes('team')) {
    return "Our team includes Ibrahim BK as Founder and CEO, Ibrahim B Balogun as Head of Security, Yaqub Ja'e as Co-Founder and CTO, and Neemah Lawal as Co-Founder and COO.";
  } else if (lowerTranscript.includes('contact')) {
    return 'You can find more information on our website at shaintelligence.com, email us at info@shaintelligence.com, or call us at +44 7853 257472.';
  } else if (lowerTranscript.includes('pricing')) {
    return 'Pricing is available upon request.';
  } else if (lowerTranscript.includes('user growth')) {
    return 'We have a user growth rate of 45.86% and have onboarded over 100 users so far.';
  }

  console.log(`No specific response found for transcript: ${transcript}`);
  return "I'm not sure how to respond to that. I'm still learning.";
}

// this will not send any audio to the caller.
// async function speakToCustomer(callSid, text) {
//   console.log(`Speaking to customer for Call SID: ${text}`);

//   const callSession = activeCalls.get(callSid);
//   if (!callSession) {
//     console.log(`No active call session found for Call SID: ${callSid}`);
//     return;
//   }

//   try {
//     // use twilio TTS to generate audio
//     const twilioClient = twilio(
//       process.env.TWILIO_ACCOUNT_SID,
//       process.env.TWILIO_AUTH_TOKEN
//     );

//     const markEvent = {
//       event: 'mark',
//       streamSid: callSession.streamSid,
//       mark: {
//         name: 'speech_response',
//       },
//     };

//     console.log('Response Sent');
//   } catch (error) {
//     console.error('Error sending response:', error);
//   }
// }

//this function be able to handle a back-and-forth conversation.
//After the bot speaks, Twilio will redirect the call back to your server, which will in turn start a new media stream and listen for the caller's next response.
//This creates the illusion of a continuous, real-time conversation, even though the underlying technology involves a series of connections and disconnections.
async function speakToCustomer(callSid, text) {
  console.log(`Speaking to customer for Call SID: ${callSid}`);
  try {
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({ voice: 'alice' }, text);
    // Redirect back to the entry point to restart the conversation
    twiml.redirect('/api/calls/re-enter-stream');

    await twilioClient.calls(callSid).update({
      twiml: twiml.toString(),
    });

    console.log('TwiML response sent, call redirected to re-enter stream.');
  } catch (error) {
    console.error('Error sending TwiML response:', error);
  }
}

function createCallSession(callSid, streamSid, ws) {
  return {
    callSid,
    streamSid,
    ws,
    startTime: new Date(),
    transcripts: [],
    context: {
      topic: null,
      customerInfo: null,
      nextStep: null,
    },
  };
}
