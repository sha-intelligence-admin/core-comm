class ResponseCache {
  constructor(maxSize = 1000, ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    
    // Clean cache every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  generateKey(transcript, context = '') {
    const normalizedTranscript = transcript.toLowerCase().trim();
    const contextHash = context ? this.simpleHash(context) : '';
    return `${normalizedTranscript}:${contextHash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  set(key, data, customTtl = null) {
    const expires = Date.now() + (customTtl || this.ttl);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      expires,
      lastAccessed: Date.now(),
      created: Date.now()
    });
  }

  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cache cleanup: removed ${cleanedCount} expired entries`);
    }
  }

  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (now > entry.expires) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

export default ResponseCache;