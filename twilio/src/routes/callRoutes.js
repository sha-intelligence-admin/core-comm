import express from 'express';
import { handleRecording, reEnterStream, UserInput, voiceCall } from '../controllers/callController.js';

const router = express.Router();

router.post('/voice', voiceCall);
router.post('/user-input', UserInput);
router.post('/handle-recording', handleRecording);
router.post('/re-enter-stream', reEnterStream);

export default router;