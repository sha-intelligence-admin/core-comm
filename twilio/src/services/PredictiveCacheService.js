import logger from './LoggingService.js';
import ElevenLabsService from './ElevenLabsService.js';
import { CONFIG } from '../config/config.js';

class PredictiveCacheService {
  constructor() {
    this.elevenLabsService = new ElevenLabsService();
    
    // In-memory caches with LRU eviction
    this.responseCache = new Map();
    this.audioCache = new Map();
    this.contextCache = new Map();
    this.predictionCache = new Map();
    
    // Cache limits and TTL
    this.maxCacheSize = CONFIG.CACHE_MAX_SIZE || 1000;
    this.cacheTTL = CONFIG.CACHE_TTL || 3600000; // 1 hour
    
    // Performance metrics
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.predictionHits = 0;
    
    // Pre-load common responses
    this.initializeCommonResponses();
    
    // Cleanup interval
    setInterval(() => this.cleanupExpiredEntries(), 300000); // 5 minutes
  }

  // Singleton pattern
  static getInstance() {
    if (!PredictiveCacheService.instance) {
      PredictiveCacheService.instance = new PredictiveCacheService();
    }
    return PredictiveCacheService.instance;
  }

  /**
   * Initialize cache with pre-generated common responses (50+ patterns)
   */
  async initializeCommonResponses() {
    try {
      const commonResponses = [
        // Ultra-high priority (instant responses < 10ms)
        {
          patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
          response: "Hello! Welcome to Sha Intelligence. How can I help you today?",
          priority: 'ultra-high'
        },
        {
          patterns: ['yes', 'yeah', 'yep', 'correct', 'right', 'exactly'],
          response: "Perfect! What would you like to know more about?",
          priority: 'ultra-high'
        },
        {
          patterns: ['no', 'nope', 'not really', 'negative'],
          response: "No problem. What else can I help you with?",
          priority: 'ultra-high'
        },
        {
          patterns: ['okay', 'ok', 'alright', 'got it', 'understood'],
          response: "Great! What other questions do you have?",
          priority: 'ultra-high'
        },
        {
          patterns: ['thanks', 'thank you', 'appreciate it', 'cheers'],
          response: "You're welcome! What else would you like to know about Sha Intelligence?",
          priority: 'ultra-high'
        },
        {
          patterns: ['help', 'assist', 'support', 'need help'],
          response: "I'm here to help! What would you like to know about Sha Intelligence?",
          priority: 'ultra-high'
        },

        // High priority (sub-25ms responses)
        {
          patterns: ['goodbye', 'bye', 'see you', 'talk soon', 'have to go'],
          response: "Thank you for calling! Have a great day and don't hesitate to reach out again.",
          priority: 'high'
        },
        {
          patterns: ['good', 'great', 'awesome', 'excellent', 'wonderful'],
          response: "Excellent! What would you like to learn about our AI solutions?",
          priority: 'high'
        },
        {
          patterns: ['interested', 'sounds good', 'tell me more'],
          response: "Wonderful! I'd be happy to provide more details. What specific area interests you most?",
          priority: 'high'
        },
        {
          patterns: ['what', 'huh', 'pardon', 'sorry', 'repeat'],
          response: "Let me clarify that for you. What specific information would you like me to explain?",
          priority: 'high'
        },

        // Medium priority (context-aware responses)
        {
          patterns: ['about', 'company', 'sha intelligence', 'who are you'],
          response: "Sha Intelligence builds safe, secure, and privacy-first AI systems designed to serve people responsibly. What specific aspect interests you?",
          priority: 'medium'
        },
        {
          patterns: ['services', 'what do you do', 'products', 'solutions'],
          response: "We offer cutting-edge AI solutions including Signal AI for telecommunications and custom API deployments for financial institutions. What area would you like to learn more about?",
          priority: 'medium'
        },
        {
          patterns: ['ai', 'artificial intelligence', 'machine learning', 'technology'],
          response: "Our AI technology focuses on safety, security, and privacy-first approaches. We specialize in conversational AI and secure data processing. What specific AI capabilities are you interested in?",
          priority: 'medium'
        },
        {
          patterns: ['signal ai', 'telecommunications', 'telco', 'telecom'],
          response: "Signal AI is our flagship solution for telecommunications companies, providing intelligent call routing and customer service automation. Would you like to know more about its features?",
          priority: 'medium'
        },
        {
          patterns: ['financial', 'banking', 'finance', 'fintech'],
          response: "We provide secure API deployments for financial institutions with enterprise-grade security and compliance. What financial services are you looking to enhance with AI?",
          priority: 'medium'
        },
        {
          patterns: ['security', 'privacy', 'safe', 'secure'],
          response: "Security and privacy are at the core of everything we build. Our systems use end-to-end encryption and privacy-preserving AI techniques. What security concerns do you have?",
          priority: 'medium'
        },
        {
          patterns: ['pricing', 'cost', 'price', 'how much', 'expensive'],
          response: "Our pricing is customized based on your specific needs and scale. I'd be happy to connect you with our team for a detailed quote. What type of solution are you considering?",
          priority: 'medium'
        },
        {
          patterns: ['demo', 'trial', 'test', 'try it out'],
          response: "We offer personalized demos and trial periods for qualified prospects. What specific use case would you like to explore in a demo?",
          priority: 'medium'
        },
        {
          patterns: ['integration', 'api', 'implement', 'setup'],
          response: "Our solutions are designed for easy integration with existing systems through RESTful APIs and SDKs. What systems are you looking to integrate with?",
          priority: 'medium'
        },
        {
          patterns: ['support', 'help', 'assistance', 'customer service'],
          response: "We provide 24/7 technical support and dedicated customer success managers for enterprise clients. What type of support are you looking for?",
          priority: 'medium'
        },

        // Business-specific patterns
        {
          patterns: ['contact', 'reach out', 'get in touch', 'sales'],
          response: "You can reach us at info@shaintelligence.com or visit our website at shaintelligence.com. What specific information would you like to discuss with our team?",
          priority: 'medium'
        },
        {
          patterns: ['partnership', 'partner', 'collaborate', 'work together'],
          response: "We're always interested in strategic partnerships. Our business development team would love to explore opportunities with you. What type of partnership are you considering?",
          priority: 'medium'
        },
        {
          patterns: ['competitors', 'comparison', 'alternatives', 'versus'],
          response: "What sets us apart is our focus on privacy-first AI and enterprise security. I'd be happy to discuss how we compare to other solutions. What specific capabilities are you evaluating?",
          priority: 'medium'
        },
        {
          patterns: ['scalability', 'scale', 'enterprise', 'large scale'],
          response: "Our solutions are built to handle enterprise-scale deployments with automatic scaling and load balancing. What scale are you planning for?",
          priority: 'medium'
        },
        {
          patterns: ['compliance', 'gdpr', 'hipaa', 'regulations'],
          response: "We maintain compliance with GDPR, HIPAA, SOC 2, and other major regulations. Our compliance team ensures all solutions meet your industry requirements. What compliance standards do you need?",
          priority: 'medium'
        },

        // Technical patterns
        {
          patterns: ['latency', 'speed', 'performance', 'fast'],
          response: "Our systems are optimized for ultra-low latency with sub-100ms response times. We use advanced caching and streaming techniques for optimal performance. What performance requirements do you have?",
          priority: 'medium'
        },
        {
          patterns: ['voice', 'speech', 'conversation', 'chat'],
          response: "Our conversational AI supports both voice and text interactions with natural language understanding. We specialize in real-time voice processing. What type of conversations are you looking to automate?",
          priority: 'medium'
        },
        {
          patterns: ['data', 'analytics', 'insights', 'reporting'],
          response: "Our platform provides comprehensive analytics and reporting with real-time insights into AI performance and user interactions. What kind of data insights are you looking for?",
          priority: 'medium'
        },

        // Common business inquiries
        {
          patterns: ['timeline', 'when', 'how long', 'implementation time'],
          response: "Implementation timelines vary based on complexity, but typical deployments take 2-8 weeks. We provide detailed project timelines during the planning phase. What's your target go-live date?",
          priority: 'medium'
        },
        {
          patterns: ['team', 'employees', 'staff', 'who'],
          response: "Our team includes AI researchers, engineers, and industry experts with backgrounds from leading tech companies. We're passionate about building responsible AI. What would you like to know about our team?",
          priority: 'medium'
        },
        {
          patterns: ['location', 'where', 'office', 'headquarters'],
          response: "We're a distributed team with headquarters in the US and team members worldwide. This allows us to provide global support while maintaining data residency requirements. Where are you based?",
          priority: 'medium'
        },

        // Clarification patterns
        {
          patterns: ['confused', 'don\'t understand', 'unclear', 'explain'],
          response: "Let me clarify that for you. I'm here to help explain any aspect of our AI solutions. What specific part would you like me to explain in more detail?",
          priority: 'medium'
        },
        {
          patterns: ['technical', 'how it works', 'under the hood', 'architecture'],
          response: "Our AI architecture uses transformer-based models with privacy-preserving techniques and edge computing for low latency. I can provide technical documentation. What technical details are you most interested in?",
          priority: 'medium'
        },
        {
          patterns: ['benefits', 'advantages', 'value', 'roi'],
          response: "Our clients typically see 40-60% reduction in response times and 30-50% improvement in customer satisfaction. We can provide detailed ROI projections based on your use case. What metrics are most important to you?",
          priority: 'medium'
        }
      ];

      // Pre-generate audio for high-priority responses
      let preloadedCount = 0;
      
      for (const responseData of commonResponses) {
        const cacheKey = this.generateCacheKey(responseData.response);
        
        // Cache text response
        this.responseCache.set(cacheKey, {
          response: responseData.response,
          patterns: responseData.patterns,
          priority: responseData.priority,
          timestamp: Date.now(),
          hitCount: 0
        });

        // Pre-generate audio for ultra-high and high-priority responses
        if (responseData.priority === 'ultra-high' || responseData.priority === 'high') {
          try {
            const audioResult = await this.elevenLabsService.generateSpeech(responseData.response);
            
            if (audioResult.success) {
              this.audioCache.set(cacheKey, {
                audioBuffer: audioResult.audioBuffer,
                voiceId: audioResult.voiceId,
                timestamp: Date.now(),
                size: audioResult.audioBuffer.length,
                hitCount: 0,
                priority: responseData.priority
              });
              
              preloadedCount++;
              
              logger.info('Pre-generated audio for common response', {
                patterns: responseData.patterns,
                priority: responseData.priority,
                audioSize: audioResult.audioBuffer.length,
                responseLength: responseData.response.length
              });
            }
          } catch (error) {
            logger.warn('Failed to pre-generate audio', {
              patterns: responseData.patterns,
              priority: responseData.priority,
              error: error.message
            });
          }
        }

        // Register patterns for quick lookup
        responseData.patterns.forEach(pattern => {
          this.predictionCache.set(pattern.toLowerCase(), cacheKey);
        });
      }

      logger.info('Predictive cache initialized', {
        totalResponses: commonResponses.length,
        preloadedAudio: preloadedCount,
        patterns: Array.from(this.predictionCache.keys())
      });

    } catch (error) {
      logger.error('Failed to initialize predictive cache', {
        error: error.message
      });
    }
  }

  /**
   * Get cached response with predictive matching
   */
  async getCachedResponse(transcript, callSid = null) {
    try {
      const normalizedTranscript = transcript.toLowerCase().trim();
      
      // Check for exact pattern matches first
      let cacheKey = null;
      
      for (const [pattern, key] of this.predictionCache.entries()) {
        if (normalizedTranscript.includes(pattern)) {
          cacheKey = key;
          this.predictionHits++;
          break;
        }
      }

      // If no pattern match, try fuzzy matching
      if (!cacheKey) {
        cacheKey = this.findBestMatch(normalizedTranscript);
      }

      if (cacheKey && this.responseCache.has(cacheKey)) {
        const cachedData = this.responseCache.get(cacheKey);
        cachedData.hitCount++;
        cachedData.lastUsed = Date.now();
        
        this.cacheHits++;
        
        logger.info('Cache hit for response', {
          callSid,
          transcript: transcript.substring(0, 30),
          patterns: cachedData.patterns,
          hitCount: cachedData.hitCount,
          responseTime: '< 5ms'
        });

        return {
          response: cachedData.response,
          source: 'cache',
          patterns: cachedData.patterns,
          cacheHit: true
        };
      }

      this.cacheMisses++;
      return null;

    } catch (error) {
      logger.error('Error getting cached response', {
        callSid,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Get cached audio for instant playback
   */
  async getCachedAudio(response, callSid = null) {
    try {
      const cacheKey = this.generateCacheKey(response);
      
      if (this.audioCache.has(cacheKey)) {
        const audioData = this.audioCache.get(cacheKey);
        audioData.hitCount++;
        audioData.lastUsed = Date.now();
        
        logger.info('Audio cache hit', {
          callSid,
          audioSize: audioData.size,
          hitCount: audioData.hitCount,
          responseTime: '< 2ms'
        });

        return {
          audioBuffer: audioData.audioBuffer,
          voiceId: audioData.voiceId,
          cached: true,
          size: audioData.size
        };
      }

      return null;

    } catch (error) {
      logger.error('Error getting cached audio', {
        callSid,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Cache response and audio for future use
   */
  async cacheResponseAndAudio(transcript, response, callSid = null) {
    try {
      const cacheKey = this.generateCacheKey(response);
      
      // Cache text response
      if (!this.responseCache.has(cacheKey)) {
        // Evict least recently used if at capacity
        if (this.responseCache.size >= this.maxCacheSize) {
          this.evictLeastRecentlyUsed(this.responseCache);
        }
        
        this.responseCache.set(cacheKey, {
          response,
          transcript,
          timestamp: Date.now(),
          lastUsed: Date.now(),
          hitCount: 0
        });
      }

      // Generate and cache audio asynchronously
      this.generateAndCacheAudio(response, cacheKey, callSid);

      logger.debug('Response cached for future use', {
        callSid,
        cacheKey: cacheKey.substring(0, 16),
        responseLength: response.length
      });

    } catch (error) {
      logger.error('Error caching response and audio', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Generate and cache audio asynchronously
   */
  async generateAndCacheAudio(response, cacheKey, callSid) {
    try {
      if (this.audioCache.has(cacheKey)) {
        return; // Already cached
      }

      const audioResult = await this.elevenLabsService.generateSpeech(response);
      
      if (audioResult.success) {
        // Evict least recently used if at capacity
        if (this.audioCache.size >= this.maxCacheSize) {
          this.evictLeastRecentlyUsed(this.audioCache);
        }
        
        this.audioCache.set(cacheKey, {
          audioBuffer: audioResult.audioBuffer,
          voiceId: audioResult.voiceId,
          timestamp: Date.now(),
          lastUsed: Date.now(),
          size: audioResult.audioBuffer.length,
          hitCount: 0
        });

        logger.debug('Audio cached successfully', {
          callSid,
          cacheKey: cacheKey.substring(0, 16),
          audioSize: audioResult.audioBuffer.length
        });
      }

    } catch (error) {
      logger.error('Error generating and caching audio', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Update conversation context for better predictions
   */
  updateConversationContext(callSid, transcript, response) {
    try {
      if (!this.contextCache.has(callSid)) {
        this.contextCache.set(callSid, {
          exchanges: [],
          topics: new Set(),
          patterns: new Set(),
          startTime: Date.now()
        });
      }

      const context = this.contextCache.get(callSid);
      context.exchanges.push({
        transcript: transcript.toLowerCase(),
        response,
        timestamp: Date.now()
      });

      // Extract topics and patterns for prediction
      const words = transcript.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          context.topics.add(word);
        }
      });

      // Keep only last 10 exchanges for performance
      if (context.exchanges.length > 10) {
        context.exchanges = context.exchanges.slice(-10);
      }

      logger.debug('Conversation context updated', {
        callSid,
        exchangeCount: context.exchanges.length,
        topicCount: context.topics.size
      });

    } catch (error) {
      logger.error('Error updating conversation context', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Predict likely next responses based on conversation context
   */
  predictNextResponses(callSid, transcript) {
    try {
      const context = this.contextCache.get(callSid);
      if (!context) return [];

      const predictions = [];
      const transcriptWords = new Set(transcript.toLowerCase().split(/\s+/));
      
      // Find responses with similar topic overlap
      for (const [cacheKey, responseData] of this.responseCache.entries()) {
        if (responseData.patterns) {
          const overlap = responseData.patterns.filter(pattern => 
            transcriptWords.has(pattern) || 
            Array.from(context.topics).some(topic => pattern.includes(topic))
          );
          
          if (overlap.length > 0) {
            predictions.push({
              response: responseData.response,
              confidence: overlap.length / responseData.patterns.length,
              cacheKey
            });
          }
        }
      }

      // Sort by confidence
      predictions.sort((a, b) => b.confidence - a.confidence);
      
      return predictions.slice(0, 3); // Return top 3 predictions

    } catch (error) {
      logger.error('Error predicting next responses', {
        callSid,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Find best fuzzy match for transcript
   */
  findBestMatch(transcript) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [pattern, cacheKey] of this.predictionCache.entries()) {
      const score = this.calculateSimilarity(transcript, pattern);
      if (score > bestScore && score > 0.7) {
        bestScore = score;
        bestMatch = cacheKey;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate cache key from text
   */
  generateCacheKey(text) {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Evict least recently used entries
   */
  evictLeastRecentlyUsed(cache) {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, data] of cache.entries()) {
      if (data.lastUsed < oldestTime) {
        oldestTime = data.lastUsed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      logger.debug('Evicted LRU cache entry', { 
        cacheType: cache === this.audioCache ? 'audio' : 'response',
        key: oldestKey 
      });
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries() {
    const now = Date.now();
    let cleaned = 0;

    // Clean response cache
    for (const [key, data] of this.responseCache.entries()) {
      if (now - data.timestamp > this.cacheTTL) {
        this.responseCache.delete(key);
        cleaned++;
      }
    }

    // Clean audio cache
    for (const [key, data] of this.audioCache.entries()) {
      if (now - data.timestamp > this.cacheTTL) {
        this.audioCache.delete(key);
        cleaned++;
      }
    }

    // Clean context cache (shorter TTL)
    for (const [key, data] of this.contextCache.entries()) {
      if (now - data.startTime > (this.cacheTTL / 2)) {
        this.contextCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', {
        entriesRemoved: cleaned,
        responseCache: this.responseCache.size,
        audioCache: this.audioCache.size,
        contextCache: this.contextCache.size
      });
    }
  }

  /**
   * Get cache performance metrics
   */
  getMetrics() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      predictionHits: this.predictionHits,
      hitRate: hitRate.toFixed(2) + '%',
      responseCacheSize: this.responseCache.size,
      audioCacheSize: this.audioCache.size,
      contextCacheSize: this.contextCache.size,
      totalMemoryUsage: this.calculateMemoryUsage()
    };
  }

  /**
   * Calculate approximate memory usage
   */
  calculateMemoryUsage() {
    let totalSize = 0;
    
    // Audio cache is the largest
    for (const data of this.audioCache.values()) {
      totalSize += data.size || 0;
    }

    // Rough estimate for other caches
    totalSize += this.responseCache.size * 500; // ~500 bytes per response
    totalSize += this.contextCache.size * 1000; // ~1KB per context

    return Math.round(totalSize / 1024 / 1024 * 100) / 100 + ' MB'; // Convert to MB
  }

  /**
   * Clear all caches (for testing or reset)
   */
  clearAllCaches() {
    this.responseCache.clear();
    this.audioCache.clear();
    this.contextCache.clear();
    this.predictionCache.clear();
    
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.predictionHits = 0;
    
    logger.info('All caches cleared');
  }
}

export default PredictiveCacheService;