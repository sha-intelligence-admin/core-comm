import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

export const voiceCall = async (req, res) => {
  console.log('Incoming Call');
  console.log('from:', req.body.From);
  console.log('to:', req.body.To);
  console.log('Call SID:', req.body.CallSid);

  try {
    const twiml = new twilio.twiml.VoiceResponse();

    const fromNumber = req.body.From ? req.body.From.trim() : '';
    const toNumber = req.body.To ? req.body.To.trim() : '';
    const websocketUrl = `wss://${req.headers.host}/api/calls/media-stream?From=${encodeURIComponent(fromNumber)}&To=${encodeURIComponent(toNumber)}`;
    console.log('WebSocket URL:', websocketUrl);
    console.log('From (clean):', fromNumber);
    console.log('To (clean):', toNumber);
    
    // Start stream to get real time audio
    const start = twiml.start();
    start.stream({
      name: 'speech-recognition-stream',
      url: websocketUrl, // Fixed URL with parameters
    });

    //initial greeting
    twiml.say(
      {
        voice: 'alice',
        language: 'en-US',
      },
      'Hello, Welcome to our demo. How can I assist you today?'
    );

    twiml.pause({
      length: 10,
    });

    const twimlString = twiml.toString();
    console.log('Generated TwiML:', twimlString);
    
    // Send response
    res.type('text/xml');
    res.send(twimlString);
  } catch (error) {
    console.error('Error handling voice call:', error);
    const fallbackTwiml = new twilio.twiml.VoiceResponse();
    fallbackTwiml.say('Sorry, there was an error. Please try again later.');
    res.status(500).send('Error handling voice call');
  }
};

export const UserInput = async (req, res) => {
  console.log('User Input');
  console.log('Digits:', req.body.Digits);
  console.log('Call SID:', req.body.CallSid);

  try {
    const UserInput = req.body.Digits;
    const twiml = new twilio.twiml.VoiceResponse();

    switch (UserInput) {
      case '1':
        twiml.say(
          'You Pressed 1. Here is some information about our services.'
        );
        break;
      case '2':
        twiml.say('You Pressed 2. Please leave your message after the beep.');
        twiml.record({
          action: '/api/calls/handle-recording',
          method: 'POST',
          maxLength: 30,
          playBeep: true,
        });
        break;
      case '3':
        twiml.say(
          'You Pressed 3. Please hold while we connect you to an agent.'
        );
        twiml.dial(process.env.AGENT_NUMBER);
        break;
      default:
        twiml.say("Sorry, I didn't get that. Goodbye!");
        break;
    }

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling user input:', error);
    res.status(500).send('Error handling user input');
  }
};

export const handleRecording = async (req, res) => {
  console.log('Recording Received');
  console.log('Recording SID:', req.body.RecordingSid);
  console.log('Call SID:', req.body.CallSid);

  try {
    const recordingUrl = req.body.RecordingUrl;
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you for your message. We will get back to you soon.');
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error handling recording:', error);
    res.status(500).send('Error handling recording');
  }
};

export const reEnterStream = async (req, res) => {
    console.log('Re-entering media stream');
    try {
        const twiml = new twilio.twiml.VoiceResponse();
        
        const start = twiml.start();
        start.stream({
            name: 'speech-recognition-stream',
            url: `wss://${req.headers.host}/api/calls/media-stream`,
        });

        twiml.pause({ length: 30 }); // Pause to listen for the user's next response

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error re-entering media stream:', error);
        res.status(500).send('Error re-entering media stream');
    }
};
