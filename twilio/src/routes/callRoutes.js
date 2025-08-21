import express from 'express';
import { handleRecording, UserInput, voiceCall } from '../controllers/callController.js';

const router = express.Router();

router.post('/voice', voiceCall);
router.post('/user-input', UserInput);
router.post('/handle-recording', handleRecording);

export default router;