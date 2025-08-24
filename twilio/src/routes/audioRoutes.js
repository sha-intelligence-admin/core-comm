import express from 'express';
import { generateGreetingAudio, generateDynamicAudio } from '../controllers/callController.js';

const router = express.Router();

// Audio endpoints for ElevenLabs - no signature verification needed as they're internal
// These endpoints serve audio directly to Twilio for playback
router.get('/greeting', generateGreetingAudio);
router.get('/dynamic', generateDynamicAudio);

export default router;
