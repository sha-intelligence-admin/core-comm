import logger from '../services/LoggingService.js';

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100;
    this.requests = new Map();
    
    // Cleanup interval to remove old entries
    setInterval(() => {
      this.cleanup();
    }, this.windowMs);
  }

  middleware() {
    return (req, res, next) => {
      const key = this.generateKey(req);
      const now = Date.now();
      
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      const userRequests = this.requests.get(key);
      
      // Remove requests outside the window
      const validRequests = userRequests.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validRequests.length >= this.maxRequests) {
        logger.warn('Rate limit exceeded', { 
          key, 
          requestCount: validRequests.length,
          maxRequests: this.maxRequests 
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          retryAfter: Math.ceil(this.windowMs / 1000)
        });
      }
      
      validRequests.push(now);
      this.requests.set(key, validRequests);
      
      next();
    };
  }

  generateKey(req) {
    // Use IP address or phone number for rate limiting
    const ip = req.ip || req.connection.remoteAddress;
    const phoneNumber = req.body?.From || req.query?.From;
    
    return phoneNumber || ip;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.windowMs
      );
      
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  getStats() {
    return {
      activeKeys: this.requests.size,
      totalRequests: Array.from(this.requests.values())
        .reduce((sum, requests) => sum + requests.length, 0)
    };
  }
}

// Create different rate limiters for different endpoints
export const webhookRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute per phone number/IP
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
});

export default RateLimiter;