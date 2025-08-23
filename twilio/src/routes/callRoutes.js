import express from 'express';
import { handleRecording, reEnterStream, UserInput, voiceCall } from '../controllers/callController.js';
import { webhookRateLimiter } from '../middleware/rateLimiter.js';
import TwilioService from '../services/TwilioService.js';
import logger from '../services/LoggingService.js';

const router = express.Router();

// Middleware for Twilio webhook signature verification
const verifyTwilioSignature = (req, res, next) => {
  const signature = req.headers['x-twilio-signature'];
//   const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const url = `https://127799d3057c.ngrok-free.app${req.originalUrl}`;
    const params = req.body;
    logger.info("Url Used", { url });
    logger.info("Signature from Twilio", { signature });

    const isValid = TwilioService.validateWebhookSignature(signature, params, url);

    logger.info("Validation result", { isValid });

  if (!isValid) {
    logger.warn('Missing Twilio signature', { url });
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    const body = JSON.stringify(req.body);
    const isValid = TwilioService.validateWebhookSignature(signature, body, url);
    
    if (!isValid) {
      logger.warn('Invalid Twilio signature', { url });
      return res.status(403).json({ error: 'Invalid signature' });
    }
    
    next();
  } catch (error) {
    logger.logError(error, { event: 'signature_verification_error', url });
    res.status(500).json({ error: 'Signature verification failed' });
  }
};

// Apply rate limiting and signature verification to webhook endpoints
router.post('/voice', webhookRateLimiter.middleware(), verifyTwilioSignature, voiceCall);
router.post('/user-input', webhookRateLimiter.middleware(), verifyTwilioSignature, UserInput);
router.post('/handle-recording', webhookRateLimiter.middleware(), verifyTwilioSignature, handleRecording);
router.post('/re-enter-stream', webhookRateLimiter.middleware(), verifyTwilioSignature, reEnterStream);

export default router;