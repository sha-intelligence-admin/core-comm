export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  NLP_CONFIDENCE_THRESHOLD: 0.7,
  
  // Deepgram configuration - optimized for speed and natural conversation flow
  DEEPGRAM_MODEL: 'nova-2', // Stable model for reliable performance
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 300, // Conservative 300ms for stability
  DEEPGRAM_CONNECTION_TIMEOUT: 10000, // Stable 10s timeout
  
  // Enhanced Voice Activity Detection and Speech Processing
  SPEECH_PAUSE_THRESHOLD: 600, // Reduced from 800ms to 600ms for faster responses
  MIN_SPEECH_DURATION: 400, // Reduced from 500ms to 400ms
  RESPONSE_DELAY_AFTER_SPEECH: 200, // Reduced from 300ms to 200ms
  MAX_SPEECH_BUFFER_TIME: 4000, // Reduced from 5000ms to 4000ms
  
  // New: Advanced speech completion detection
  SMART_PAUSE_DETECTION: true, // Enable intelligent pause detection
  QUESTION_PAUSE_DURATION: 350, // ms - Shorter pause for questions
  STATEMENT_PAUSE_DURATION: 500, // ms - Medium pause for statements
  INCOMPLETE_PAUSE_DURATION: 800, // ms - Longer pause for incomplete thoughts
  MAX_SPEECH_EXTENSION: 2000, // ms - Maximum time to wait for speech continuation
  
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