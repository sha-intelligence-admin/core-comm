import express from 'express';
import { handleRecording, UserInput, voiceCall } from '../controllers/callController.js';
// import { webhookRateLimiter } from '../middleware/rateLimiter.js';
import TwilioService from '../services/TwilioService.js';
import logger from '../services/LoggingService.js';

const router = express.Router();

// Middleware for Twilio webhook signature verification
const verifyTwilioSignature = (req, res, next) => {
  const signature = req.headers['x-twilio-signature'];
  const url = `https://${process.env.NGROK_URL}${req.originalUrl}`;

  logger.info("Url Used", { url });
  logger.info("Signature from Twilio", { signature });

  try {
    const body = JSON.stringify(req.body);
    const isValid = TwilioService.validateWebhookSignature(
      signature,
      body,
      url
    );

    logger.info("Validation result", { isValid });

    if (!isValid) {
      logger.warn('Invalid Twilio signature', { url });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    next();
  } catch (error) {
    logger.error("Signature verification error", { error, url });
    res.status(500).json({ error: 'Signature verification failed' });
  }
};


// Apply rate limiting and signature verification to webhook endpoints
router.post('/voice',  voiceCall);
router.post('/user-input', UserInput);
router.post('/handle-recording', handleRecording);
// router.post('/re-enter-stream', reEnterStream);

export default router;