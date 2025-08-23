class LoggingService {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta
    });
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  logCallEvent(event, callSid, meta = {}) {
    this.info(`Call ${event}`, {
      callSid,
      event,
      ...meta
    });
  }

  logTranscript(callSid, transcript, confidence) {
    this.debug('Transcript received', {
      callSid,
      transcript: transcript.substring(0, 100), // Truncate for logging
      confidence: (confidence * 100).toFixed(1) + '%'
    });
  }

  logDeepgramEvent(event, callSid, meta = {}) {
    this.info(`Deepgram ${event}`, {
      callSid,
      event,
      ...meta
    });
  }

  logError(error, context = {}) {
    this.error(error.message, {
      stack: error.stack,
      ...context
    });
  }
}

// Singleton instance
const logger = new LoggingService();
export default logger;