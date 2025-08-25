export const CONFIG = {
  // Confidence thresholds
  CONFIDENCE_THRESHOLD: 0.6,
  NLP_CONFIDENCE_THRESHOLD: 0.7,

  // Deepgram configuration - optimized for speed
  DEEPGRAM_MODEL: 'nova-2',
  DEEPGRAM_LANGUAGE: 'en-US',
  DEEPGRAM_ENDPOINTING: 300, // Reduced from 1000ms to 300ms for faster response
  DEEPGRAM_CONNECTION_TIMEOUT: 8000, // Reduced from 10s to 8s

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
    'ELEVENLABS_API_KEY',
  ],

  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3, // Reduced from 0.7
  OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS) || 150, // Reduced from 150
  OPENAI_TIMEOUT: parseInt(process.env.OPENAI_TIMEOUT) || 8000, // 8 second timeout

  // ElevenLabs Optimization
  ELEVENLABS_STABILITY: parseFloat(process.env.ELEVENLABS_STABILITY) || 0.5, // Faster generation
  ELEVENLABS_SIMILARITY_BOOST:
    parseFloat(process.env.ELEVENLABS_SIMILARITY_BOOST) || 0.75,
  ELEVENLABS_OPTIMIZE_LATENCY:
    parseInt(process.env.ELEVENLABS_OPTIMIZE_LATENCY) || 3,
  ELEVENLABS_OUTPUT_FORMAT:
    process.env.ELEVENLABS_OUTPUT_FORMAT || 'mp3_22050_32',

  // Response Management
  MAX_RESPONSE_LENGTH: parseInt(process.env.MAX_RESPONSE_LENGTH) || 200,
  ENABLE_RESPONSE_CHUNKING: process.env.ENABLE_RESPONSE_CHUNKING === 'true',
  ENABLE_RESPONSE_CACHING: process.env.ENABLE_RESPONSE_CACHING !== 'false',
  CACHE_DURATION: parseInt(process.env.CACHE_DURATION) || 300000, // 5 minutes

  // Performance Settings
  CONCURRENT_PROCESSING: process.env.CONCURRENT_PROCESSING !== 'false',
  PRELOAD_COMMON_RESPONSES: process.env.PRELOAD_COMMON_RESPONSES !== 'false',

  // Conversation History Limits
  MAX_CONVERSATION_HISTORY: parseInt(process.env.MAX_CONVERSATION_HISTORY) || 6, // Reduced from 20

  // Response timeouts
  RESPONSE_TIMEOUT: parseInt(process.env.RESPONSE_TIMEOUT) || 5000,
  TTS_TIMEOUT: parseInt(process.env.TTS_TIMEOUT) || 8000,
};
