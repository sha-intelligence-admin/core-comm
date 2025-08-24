import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import ElevenLabsService from '../services/ElevenLabsService.js';

dotenv.config();

const elevenLabsService = new ElevenLabsService();

// Array of greeting options
const greetingOptions = [
  "Hi there! Thanks for calling Sha Intelligence. I'm here to help - what can I do for you today?",
  "Good day! Thanks for calling Sha Intelligence. I'd be happy to assist you - what would you like to know?",
  "Hello! You've reached Sha Intelligence. What brings you to us today?",
  "Hey, thanks for calling! This is Sha Intelligence. How can I help you out?",
  "Hi! Thanks for reaching out to Sha Intelligence. What can I help you with today?",
  "Hello, and thank you for calling Sha Intelligence. I'd be happy to assist you - what's on your mind?",
  "Hi! You've connected with Sha Intelligence. I'm here to answer any questions you might have.",
  "Good day! You've reached Sha Intelligence. What would you like to learn about today?",
  "Hello! Thanks for calling Sha Intelligence. What can I tell you about our AI solutions?",
  "Hi there! You've reached Sha Intelligence. I'm ready to help - what brings you here today?"
];

// Function to get random greeting
const getRandomGreeting = () => {
  const randomIndex = Math.floor(Math.random() * greetingOptions.length);
  return greetingOptions[randomIndex];
};

// Add this endpoint to serve dynamic ElevenLabs audio
export const generateGreetingAudio = async (req, res) => {
  try {
    const greetingText = getRandomGreeting();
    console.log('Using greeting:', greetingText);
    
    const result = await elevenLabsService.generateSpeech(greetingText);
    
    if (result.success) {
      // Set proper headers for audio
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', result.audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=300'); // Shorter cache for random greetings
      
      // Send the audio buffer
      res.send(result.audioBuffer);
    } else {
      console.error('ElevenLabs generation failed:', result.error);
      res.status(500).json({ error: 'Failed to generate audio', details: result.error });
    }
  } catch (error) {
    console.error('Error generating greeting audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dynamic audio endpoint for any text during conversation
export const generateDynamicAudio = async (req, res) => {
  try {
    // Get text from query parameter (base64 encoded)
    const encodedText = req.query.text;
    if (!encodedText) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }
    
    // Decode the text
    const text = Buffer.from(encodedText, 'base64').toString('utf-8');
    console.log('Generating dynamic ElevenLabs audio for:', text.substring(0, 50));
    
    const result = await elevenLabsService.generateSpeech(text);
    
    if (result.success && Buffer.isBuffer(result.audioBuffer) && result.audioBuffer.length > 0) {
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': result.audioBuffer.length,
        'Cache-Control': 'public, max-age=300'
      });
      res.end(result.audioBuffer);
    } else {
      console.error('ElevenLabs generation failed:', result.error);
      res.status(500).json({ error: 'Failed to generate audio', details: result.error });
    }
  } catch (error) {
    console.error('Error generating dynamic audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Updated voice call handler
export const voiceCall = async (req, res) => {
  console.log('Incoming Call');
  console.log('from:', req.body.From);
  console.log('to:', req.body.To);
  console.log('Call SID:', req.body.CallSid);

  try {
    const twiml = new twilio.twiml.VoiceResponse();

    const fromNumber = req.body.From ? req.body.From.trim() : '';
    const toNumber = req.body.To ? req.body.To.trim() : '';
    
    const websocketUrl = `wss://${req.headers.host}/api/calls/media-stream/${encodeURIComponent(fromNumber)}/${encodeURIComponent(toNumber)}`;
    
    console.log('WebSocket URL:', websocketUrl);

    // Start stream
    const start = twiml.start();
    start.stream({
      name: 'speech-recognition-stream',
      url: websocketUrl,
    });

    // Use ElevenLabs audio URL if available, with Twilio fallback
    const useElevenLabs = process.env.USE_ELEVENLABS_TTS === 'true';
    
    if (useElevenLabs) {
      const greetingAudioUrl = `https://${req.headers.host}/api/audio/greeting`;
      twiml.play(greetingAudioUrl);
      console.log('Using ElevenLabs greeting audio:', greetingAudioUrl);
    } else {
      // Fallback to Twilio TTS with random greeting
      const randomGreeting = getRandomGreeting();
      console.log('Using Twilio TTS with greeting:', randomGreeting);
      
      twiml.say({
        voice: 'alice',
        language: 'en-US',
      }, randomGreeting);
    }

    twiml.pause({ length: 3600 });

    const twimlString = twiml.toString();
    console.log('Generated TwiML:', twimlString);

    res.type('text/xml');
    res.send(twimlString);
    
  } catch (error) {
    console.error('Error handling voice call:', error);
    const fallbackTwiml = new twilio.twiml.VoiceResponse();
    fallbackTwiml.say('Sorry, there was an error. Please try again later.');
    res.status(500).send(fallbackTwiml.toString());
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