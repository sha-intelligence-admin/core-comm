export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  NLP_CONFIDENCE_THRESHOLD: 0.7,
  
  // Deepgram configuration - optimized for speed
  DEEPGRAM_MODEL: 'nova-2',
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 200, // Reduced from 300ms to 200ms for even faster response
  DEEPGRAM_CONNECTION_TIMEOUT: 6000, // Reduced from 8000ms to 6000ms
  
  // Timeout settings (in milliseconds) - all reduced for speed
  WEBSOCKET_TIMEOUT: 20000, // Reduced from 30000ms
  DEEPGRAM_RETRY_TIMEOUT: 2000, // Reduced from 3000ms to 2000ms
  
  // Retry configuration - faster failover
  MAX_DEEPGRAM_RETRIES: 1, // Reduced from 2 to 1 for faster failover
  RETRY_DELAY: 300, // Reduced from 500ms to 300ms
  
  // Call session cleanup
  CALL_SESSION_CLEANUP_INTERVAL: 60000, // 1 minute
  CALL_SESSION_MAX_AGE: 3600000, // 1 hour
  
  // Twilio configuration
  TWILIO_VOICE: 'alice',
  
  // Environment validation
  REQUIRED_ENV_VARS: [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'DEEPGRAM_API_KEY',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY'
  ]
};