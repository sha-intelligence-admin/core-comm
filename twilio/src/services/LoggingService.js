class LoggingService {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.isProduction = process.env.NODE_ENV === 'production';
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Performance tracking
    this.metrics = {
      totalLogs: 0,
      errorLogs: 0,
      warnLogs: 0,
      infoLogs: 0,
      debugLogs: 0,
      startTime: Date.now()
    };
    
    // Rate limiting for high-frequency logs
    this.rateLimitMap = new Map();
    this.rateLimitWindow = 60000; // 1 minute
    this.maxLogsPerWindow = 1000;
    
    // Sensitive data patterns to redact
    this.sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b4[0-9]{12}(?:[0-9]{3})?\b/g, // Credit card (Visa)
      /\b5[1-5][0-9]{14}\b/g, // Credit card (MasterCard)
      /\bsk-[a-zA-Z0-9]{48}\b/g, // OpenAI API key
      /\bAC[a-zA-Z0-9]{32}\b/g, // Twilio Account SID
      /\b[0-9]{10,15}\b/g // Phone numbers
    ];
    
    // Setup log rotation if in production
    if (this.isProduction) {
      this.setupLogRotation();
    }
  }

  /**
   * Setup log rotation for production
   */
  setupLogRotation() {
    // Log metrics every 5 minutes
    setInterval(() => {
      this.logMetricsSummary();
    }, 300000);
    
    // Clean up rate limit map every minute
    setInterval(() => {
      this.cleanupRateLimitMap();
    }, this.rateLimitWindow);
  }

  /**
   * Clean up rate limit tracking
   */
  cleanupRateLimitMap() {
    const now = Date.now();
    for (const [key, data] of this.rateLimitMap.entries()) {
      if (now - data.windowStart >= this.rateLimitWindow) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Check if logging is rate limited
   */
  isRateLimited(key = 'global') {
    const now = Date.now();
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, {
        count: 1,
        windowStart: now
      });
      return false;
    }
    
    const rateLimitData = this.rateLimitMap.get(key);
    
    // Reset window if expired
    if (now - rateLimitData.windowStart >= this.rateLimitWindow) {
      rateLimitData.count = 1;
      rateLimitData.windowStart = now;
      return false;
    }
    
    // Check if under limit
    if (rateLimitData.count < this.maxLogsPerWindow) {
      rateLimitData.count++;
      return false;
    }
    
    return true; // Rate limited
  }

  /**
   * Sanitize message to remove sensitive data
   */
  sanitizeMessage(message) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    
    let sanitized = message;
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    
    return sanitized;
  }

  /**
   * Sanitize metadata object
   */
  sanitizeMeta(meta) {
    if (!meta || typeof meta !== 'object') {
      return meta;
    }
    
    const sanitized = { ...meta };
    
    // Common sensitive field names
    const sensitiveFields = [
      'password', 'token', 'key', 'secret', 'auth', 'credential',
      'apikey', 'api_key', 'authtoken', 'auth_token', 'authorization'
    ];
    
    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeMessage(value);
      }
    }
    
    return sanitized;
  }

  formatMessage(level, message, meta = {}) {
    // Sanitize sensitive data in production
    const sanitizedMessage = this.isProduction ? 
      this.sanitizeMessage(message) : message;
    
    const sanitizedMeta = this.isProduction ? 
      this.sanitizeMeta(meta) : meta;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message: sanitizedMessage,
      pid: process.pid,
      service: 'voice-agent-streaming',
      version: process.env.npm_package_version || '1.0.0',
      ...sanitizedMeta
    };

    // Add memory usage for error and warn logs in production
    if (this.isProduction && (level === 'error' || level === 'warn')) {
      const memUsage = process.memoryUsage();
      logEntry.memoryUsage = {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      };
    }

    return JSON.stringify(logEntry);
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  error(message, meta = {}) {
    if (this.shouldLog('error') && !this.isRateLimited('error')) {
      console.error(this.formatMessage('error', message, meta));
      this.metrics.errorLogs++;
      this.metrics.totalLogs++;
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn') && !this.isRateLimited('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
      this.metrics.warnLogs++;
      this.metrics.totalLogs++;
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('info') && !this.isRateLimited('info')) {
      console.info(this.formatMessage('info', message, meta));
      this.metrics.infoLogs++;
      this.metrics.totalLogs++;
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug') && !this.isRateLimited('debug')) {
      console.log(this.formatMessage('debug', message, meta));
      this.metrics.debugLogs++;
      this.metrics.totalLogs++;
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
      errorType: error.constructor.name,
      ...context
    });
  }

  /**
   * Log metrics summary
   */
  logMetricsSummary() {
    const uptime = Date.now() - this.metrics.startTime;
    const uptimeHours = Math.round(uptime / 3600000 * 100) / 100;
    
    this.info('Logging service metrics summary', {
      uptime: uptimeHours + 'h',
      totalLogs: this.metrics.totalLogs,
      errorLogs: this.metrics.errorLogs,
      warnLogs: this.metrics.warnLogs,
      infoLogs: this.metrics.infoLogs,
      debugLogs: this.metrics.debugLogs,
      logsPerHour: Math.round(this.metrics.totalLogs / uptimeHours),
      errorRate: this.metrics.totalLogs > 0 ? 
        ((this.metrics.errorLogs / this.metrics.totalLogs) * 100).toFixed(2) + '%' : '0%'
    });
  }

  /**
   * Get logging metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    
    return {
      ...this.metrics,
      uptime,
      logsPerSecond: Math.round((this.metrics.totalLogs / (uptime / 1000)) * 100) / 100,
      errorRate: this.metrics.totalLogs > 0 ? 
        (this.metrics.errorLogs / this.metrics.totalLogs) * 100 : 0
    };
  }

  /**
   * Performance-aware logging for high-frequency operations
   */
  logHighFrequency(level, message, meta = {}, key = 'high-freq') {
    // Only log every 10th occurrence for high-frequency operations
    const rateLimitData = this.rateLimitMap.get(key) || { count: 0 };
    
    if (rateLimitData.count % 10 === 0) {
      this[level](`${message} (${rateLimitData.count + 1} occurrences)`, meta);
    }
    
    rateLimitData.count = (rateLimitData.count || 0) + 1;
    this.rateLimitMap.set(key, rateLimitData);
  }

  /**
   * Emergency logging (bypasses rate limiting)
   */
  emergency(message, meta = {}) {
    console.error(this.formatMessage('error', `EMERGENCY: ${message}`, {
      emergency: true,
      ...meta
    }));
    this.metrics.errorLogs++;
    this.metrics.totalLogs++;
  }
}

// Singleton instance
const logger = new LoggingService();
export default logger;