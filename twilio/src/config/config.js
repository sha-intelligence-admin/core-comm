export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  NLP_CONFIDENCE_THRESHOLD: 0.7,
  
  // Deepgram configuration - optimized for speed and natural conversation flow
  DEEPGRAM_MODEL: 'nova-2',
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 250, // Further reduced for faster response while maintaining quality
  DEEPGRAM_CONNECTION_TIMEOUT: 8000, // Reduced from 10s to 8s
  
  // Voice Activity Detection and Speech Processing
  SPEECH_PAUSE_THRESHOLD: 800, // ms - Time to wait after speech ends before responding
  MIN_SPEECH_DURATION: 500, // ms - Minimum speech duration to consider valid input
  RESPONSE_DELAY_AFTER_SPEECH: 300, // ms - Brief pause before agent responds
  MAX_SPEECH_BUFFER_TIME: 5000, // ms - Maximum time to buffer speech for complete thoughts
  
  // Timeout settings (in milliseconds)
  WEBSOCKET_TIMEOUT: 30000, // 30 seconds
  DEEPGRAM_RETRY_TIMEOUT: 3000, // Reduced from 5s to 3s
  
  // Retry configuration
  MAX_DEEPGRAM_RETRIES: 2, // Reduced from 3 to 2 for faster failover
  RETRY_DELAY: 500, // Reduced from 1000ms to 500ms
  
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