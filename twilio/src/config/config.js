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
  
  // New: Enhanced streaming pipeline configuration (optimized for speed)
  ENABLE_STREAMING_PIPELINE: true, // Enable the new streaming architecture
  STREAM_CHUNK_SIZE: 512, // Reduced audio chunk size for faster delivery
  STREAM_BUFFER_SIZE: 4096, // Optimized buffer size for lower latency
  TEXT_CHUNK_MIN_LENGTH: 4, // Start TTS after 4 characters (reduced from 8)
  MIN_WORDS_FOR_TTS: 1, // Minimum words before starting TTS (reduced from 2)
  PARALLEL_TTS_GENERATION: true, // Generate TTS in parallel with text streaming
  ENABLE_WORD_BOUNDARY_STREAMING: true, // Enable word-by-word streaming
  WORD_CHUNK_THRESHOLD: 3, // Start TTS after 3 words for word-boundary streaming
  
  // Quick response and caching configuration (optimized for speed)
  QUICK_RESPONSE_TIMEOUT: 25, // Ultra-fast timeout for quick response detection (ms)
  ULTRA_HIGH_PRIORITY_TIMEOUT: 10, // Instant timeout for ultra-high priority responses (ms)
  ENABLE_PREDICTIVE_CACHING: true, // Enable predictive response caching
  CACHE_MAX_SIZE: 2000, // Increased maximum number of cached responses
  CACHE_TTL: 7200000, // Extended cache time-to-live (2 hours)
  PRELOAD_COMMON_RESPONSES: true, // Pre-generate audio for common responses
  ENABLE_PRIORITY_CACHING: true, // Enable priority-based caching
  
  // Real-time streaming optimizations
  REALTIME_POLLING_INTERVAL: 1, // Start with 1ms polling for ultra-low latency
  ADAPTIVE_POLLING: true, // Use adaptive polling based on chunk availability
  MAX_POLLING_INTERVAL: 5, // Maximum polling interval (ms)
  STREAM_PRIORITY_QUEUING: true, // Prioritize high-priority audio chunks
  
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
  
  // Production safety and limits
  MAX_CONCURRENT_STREAMS: 100, // Maximum concurrent audio streams
  MAX_TEXT_LENGTH: 5000, // Maximum text length for TTS
  MAX_CACHE_MEMORY_MB: 512, // Maximum cache memory usage
  RATE_LIMIT_REQUESTS_PER_MINUTE: 1000, // Rate limiting
  MAX_WEBSOCKET_CONNECTIONS: 50, // Maximum WebSocket connections per server
  
  // Error handling and circuit breaker
  CIRCUIT_BREAKER_THRESHOLD: 10, // Failures before circuit breaker opens
  CIRCUIT_BREAKER_TIMEOUT: 60000, // Circuit breaker timeout (1 minute)
  MAX_RETRY_ATTEMPTS: 3, // Maximum retry attempts for failed operations
  EXPONENTIAL_BACKOFF_BASE: 1000, // Base delay for exponential backoff
  
  // Health check configuration
  HEALTH_CHECK_INTERVAL: 30000, // Health check interval (30 seconds)
  SERVICE_HEALTH_TIMEOUT: 5000, // Service health check timeout
  
  // Environment validation
  REQUIRED_ENV_VARS: [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'DEEPGRAM_API_KEY',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY',
    'NODE_ENV'
  ],
  
  // Development vs Production settings
  get IS_PRODUCTION() {
    return process.env.NODE_ENV === 'production';
  },
  
  get LOG_LEVEL() {
    return this.IS_PRODUCTION ? 'info' : 'debug';
  },
  
  get ENABLE_DETAILED_LOGGING() {
    return !this.IS_PRODUCTION;
  }
};

// Environment validation function
export function validateEnvironment() {
  const missing = CONFIG.REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URLs
  if (process.env.SUPABASE_URL && !isValidUrl(process.env.SUPABASE_URL)) {
    throw new Error('SUPABASE_URL must be a valid URL');
  }
  
  // Validate API keys (basic format check)
  const apiKeys = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'DEEPGRAM_API_KEY',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY'
  ];
  
  for (const key of apiKeys) {
    if (process.env[key] && process.env[key].length < 10) {
      throw new Error(`${key} appears to be invalid (too short)`);
    }
  }
  
  console.log('✅ Environment validation passed');
  return true;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}