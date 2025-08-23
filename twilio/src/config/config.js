export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.7,
  NLP_CONFIDENCE_THRESHOLD: 0.7,
  
  // Deepgram configuration
  DEEPGRAM_MODEL: 'nova-2',
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 300,
  
  // Timeout settings (in milliseconds)
  WEBSOCKET_TIMEOUT: 30000, // 30 seconds
  DEEPGRAM_CONNECTION_TIMEOUT: 10000, // 10 seconds
  DEEPGRAM_RETRY_TIMEOUT: 5000, // 5 seconds
  
  // Retry configuration
  MAX_DEEPGRAM_RETRIES: 3,
  RETRY_DELAY: 1000,
  
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
    'DEEPGRAM_API_KEY'
  ]
};