export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  NLP_CONFIDENCE_THRESHOLD: 0.7,
  
  // Deepgram configuration - optimized for speed and natural conversation flow
  DEEPGRAM_MODEL: 'nova-2', // Stable model for reliable performance
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 300, // Conservative 300ms for stability
  DEEPGRAM_CONNECTION_TIMEOUT: 10000, // Stable 10s timeout
  
  // Ultra-fast Voice Activity Detection and Speech Processing
  SPEECH_PAUSE_THRESHOLD: 50, // Minimal pause for instant processing
  MIN_SPEECH_DURATION: 200, // Very short minimum duration
  RESPONSE_DELAY_AFTER_SPEECH: 0, // No artificial delay
  MAX_SPEECH_BUFFER_TIME: 1000, // Reduced buffer time
  
  // Streaming-first speech completion detection
  SMART_PAUSE_DETECTION: false, // Disable complex logic for speed
  QUESTION_PAUSE_DURATION: 10, // Near-instant for questions
  STATEMENT_PAUSE_DURATION: 10, // Near-instant for statements
  INCOMPLETE_PAUSE_DURATION: 25, // Very short for incomplete thoughts
  MAX_SPEECH_EXTENSION: 200, // Minimal wait for speech continuation
  
  // New: Streaming pipeline configuration
  ENABLE_STREAMING_PIPELINE: true, // Enable the new streaming architecture
  STREAM_CHUNK_SIZE: 1024, // Audio chunk size in bytes
  STREAM_BUFFER_SIZE: 8192, // Maximum buffer size
  TEXT_CHUNK_MIN_LENGTH: 8, // Start TTS after 8 characters
  PARALLEL_TTS_GENERATION: true, // Generate TTS in parallel with text streaming
  
  // Timeout settings (in milliseconds)
  WEBSOCKET_TIMEOUT: 30000, // 30 seconds
  DEEPGRAM_RETRY_TIMEOUT: 1000, // Ultra-fast retry for streaming
  STARTUP_DELAY: 250, // Ultra-fast startup for streaming
  
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