import WebSocket from 'ws';
import logger from '../services/LoggingService.js';
import StreamingPipelineService from '../services/StreamingPipelineService.js';
import { CONFIG, validateEnvironment } from '../config/config.js';

class WebSocketStreamingService {
  constructor() {
    this.streamingPipeline = StreamingPipelineService.getInstance();
    this.activeConnections = new Map();
    this.connectionMetrics = new Map();
    
    // Production safety limits
    this.maxConnections = CONFIG.MAX_WEBSOCKET_CONNECTIONS || 50;
    this.rateLimitMap = new Map(); // For rate limiting per IP
    this.rateLimitWindow = 60000; // 1 minute window
    this.maxRequestsPerWindow = CONFIG.RATE_LIMIT_REQUESTS_PER_MINUTE || 1000;
    
    // Cleanup intervals
    this.setupCleanupIntervals();
  }

  /**
   * Setup cleanup intervals for production safety
   */
  setupCleanupIntervals() {
    // Clean up stale connections every 5 minutes
    setInterval(() => {
      this.cleanupStaleConnections();
    }, 300000);
    
    // Reset rate limiting every minute
    setInterval(() => {
      this.resetRateLimits();
    }, this.rateLimitWindow);
  }

  /**
   * Check rate limiting for IP address
   */
  checkRateLimit(clientIp) {
    const now = Date.now();
    const key = clientIp;
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, {
        count: 1,
        windowStart: now
      });
      return true;
    }
    
    const rateLimitData = this.rateLimitMap.get(key);
    
    // Reset window if expired
    if (now - rateLimitData.windowStart >= this.rateLimitWindow) {
      rateLimitData.count = 1;
      rateLimitData.windowStart = now;
      return true;
    }
    
    // Check if under limit
    if (rateLimitData.count < this.maxRequestsPerWindow) {
      rateLimitData.count++;
      return true;
    }
    
    return false; // Rate limited
  }

  /**
   * Reset rate limits
   */
  resetRateLimits() {
    const now = Date.now();
    for (const [key, data] of this.rateLimitMap.entries()) {
      if (now - data.windowStart >= this.rateLimitWindow) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes
    let cleaned = 0;
    
    for (const [connectionId, connection] of this.activeConnections.entries()) {
      if (now - connection.startTime > staleThreshold && !connection.connected) {
        this.activeConnections.delete(connectionId);
        this.connectionMetrics.delete(connectionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('Cleaned up stale WebSocket connections', { 
        cleanedConnections: cleaned,
        remainingConnections: this.activeConnections.size
      });
    }
  }

  /**
   * Initialize WebSocket server for ultra-low latency streaming
   */
  initializeWebSocketServer(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws/audio-stream',
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: CONFIG.STREAM_CHUNK_SIZE,
          windowBits: 13,
          level: 3
        },
        threshold: 256,
        concurrencyLimit: 4
      }
    });

    this.wss.on('connection', (ws, request) => {
      this.handleWebSocketConnection(ws, request);
    });

    logger.info('WebSocket streaming server initialized', {
      path: '/ws/audio-stream',
      chunkSize: CONFIG.STREAM_CHUNK_SIZE
    });

    return this.wss;
  }

  /**
   * Handle new WebSocket connection with production safety
   */
  handleWebSocketConnection(ws, request) {
    const clientIp = request.socket.remoteAddress || request.headers['x-forwarded-for'] || 'unknown';
    
    try {
      // Check connection limits
      if (this.activeConnections.size >= this.maxConnections) {
        logger.warn('WebSocket connection limit exceeded', {
          activeConnections: this.activeConnections.size,
          limit: this.maxConnections,
          clientIp
        });
        ws.close(4008, 'Connection limit exceeded');
        return;
      }

      // Check rate limiting
      if (!this.checkRateLimit(clientIp)) {
        logger.warn('WebSocket rate limit exceeded', { clientIp });
        ws.close(4029, 'Rate limit exceeded');
        return;
      }

      // Validate request parameters
      const url = new URL(request.url, `http://${request.headers.host}`);
      const callSid = url.searchParams.get('callSid');
      
      if (!callSid || typeof callSid !== 'string' || callSid.length < 5) {
        logger.warn('Invalid callSid parameter', { callSid, clientIp });
        ws.close(4000, 'Missing or invalid callSid parameter');
        return;
      }

      // Additional security checks
      if (callSid.length > 100) {
        logger.warn('CallSid too long', { callSid: callSid.substring(0, 20), clientIp });
        ws.close(4000, 'Invalid callSid format');
        return;
      }

    } catch (error) {
      logger.error('WebSocket connection validation failed', {
        error: error.message,
        clientIp
      });
      ws.close(4000, 'Invalid request');
      return;
    }

    const connectionId = `ws-${callSid}-${Date.now()}`;
    
    // Store connection details
    this.activeConnections.set(connectionId, {
      ws,
      callSid,
      connected: true,
      startTime: Date.now(),
      bytesStreamed: 0,
      chunksStreamed: 0
    });

    // Initialize metrics
    this.connectionMetrics.set(connectionId, {
      connectionLatency: Date.now() - request.startTime,
      avgChunkLatency: 0,
      totalChunks: 0,
      errors: 0
    });

    logger.info('WebSocket connection established', {
      connectionId,
      callSid,
      userAgent: request.headers['user-agent'],
      origin: request.headers.origin
    });

    // Set up WebSocket event handlers
    this.setupWebSocketHandlers(ws, connectionId, callSid);

    // Start ultra-low latency streaming
    this.startUltraLowLatencyStreaming(connectionId);
  }

  /**
   * Set up WebSocket event handlers
   */
  setupWebSocketHandlers(ws, connectionId, callSid) {
    const connection = this.activeConnections.get(connectionId);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleWebSocketMessage(connectionId, data);
      } catch (error) {
        logger.error('Invalid WebSocket message', {
          connectionId,
          callSid,
          error: error.message
        });
      }
    });

    ws.on('close', (code, reason) => {
      this.handleWebSocketClose(connectionId, code, reason);
    });

    ws.on('error', (error) => {
      this.handleWebSocketError(connectionId, error);
    });

    ws.on('ping', (data) => {
      ws.pong(data);
    });

    // Send connection acknowledgment
    this.sendWebSocketMessage(connectionId, {
      type: 'connection-ack',
      connectionId,
      callSid,
      timestamp: Date.now(),
      config: {
        chunkSize: CONFIG.STREAM_CHUNK_SIZE,
        pollingInterval: CONFIG.REALTIME_POLLING_INTERVAL
      }
    });
  }

  /**
   * Handle WebSocket messages from client
   */
  handleWebSocketMessage(connectionId, data) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) return;

    const { callSid } = connection;

    switch (data.type) {
      case 'stream-request':
        logger.debug('Stream request received via WebSocket', {
          connectionId,
          callSid,
          priority: data.priority
        });
        break;

      case 'ping':
        this.sendWebSocketMessage(connectionId, {
          type: 'pong',
          timestamp: Date.now(),
          originalTimestamp: data.timestamp
        });
        break;

      case 'stream-status':
        const isActive = this.streamingPipeline.isStreamActive(callSid);
        this.sendWebSocketMessage(connectionId, {
          type: 'stream-status-response',
          active: isActive,
          timestamp: Date.now()
        });
        break;

      default:
        logger.warn('Unknown WebSocket message type', {
          connectionId,
          type: data.type
        });
    }
  }

  /**
   * Start ultra-low latency streaming (0.5ms polling)
   */
  startUltraLowLatencyStreaming(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) return;

    const { callSid } = connection;
    let consecutiveEmptyPolls = 0;
    let pollInterval = 0.5; // Start with 0.5ms for ultra-low latency
    let lastChunkTime = Date.now();

    const streamLoop = () => {
      if (!connection.connected) return;

      const audioChunk = this.streamingPipeline.getNextAudioChunk(callSid);
      
      if (audioChunk) {
        try {
          const chunkStart = Date.now();
          
          // Send audio chunk via WebSocket
          this.sendAudioChunk(connectionId, audioChunk);
          
          // Update metrics
          connection.chunksStreamed++;
          connection.bytesStreamed += audioChunk.chunk?.length || 0;
          
          const chunkLatency = Date.now() - (audioChunk.timestamp || chunkStart);
          this.updateConnectionMetrics(connectionId, chunkLatency);
          
          consecutiveEmptyPolls = 0;
          pollInterval = 0.5; // Reset to ultra-low latency
          lastChunkTime = Date.now();
          
          logger.debug('WebSocket audio chunk sent', {
            connectionId,
            callSid,
            chunkIndex: audioChunk.index,
            chunkSize: audioChunk.chunk?.length || 0,
            latency: chunkLatency,
            pollInterval
          });
          
        } catch (error) {
          logger.error('Error sending WebSocket audio chunk', {
            connectionId,
            callSid,
            error: error.message
          });
          
          this.connectionMetrics.get(connectionId).errors++;
        }
      } else {
        // Adaptive polling for efficiency
        consecutiveEmptyPolls++;
        
        if (consecutiveEmptyPolls > 20) {
          pollInterval = Math.min(pollInterval * 1.2, 5); // Max 5ms
        }
      }

      // Continue streaming if connection is active
      if (connection.connected) {
        // Use high-precision timing for ultra-low latency
        setTimeout(streamLoop, pollInterval);
      }

      // Check if stream should continue
      if (!this.streamingPipeline.isStreamActive(callSid) && 
          Date.now() - lastChunkTime > 1000) {
        logger.info('WebSocket stream completed', {
          connectionId,
          callSid,
          chunksStreamed: connection.chunksStreamed,
          bytesStreamed: connection.bytesStreamed,
          duration: Date.now() - connection.startTime
        });
        
        this.sendWebSocketMessage(connectionId, {
          type: 'stream-complete',
          timestamp: Date.now(),
          stats: {
            chunksStreamed: connection.chunksStreamed,
            bytesStreamed: connection.bytesStreamed,
            duration: Date.now() - connection.startTime
          }
        });
      }
    };

    // Start the ultra-low latency streaming loop
    streamLoop();
  }

  /**
   * Send audio chunk via WebSocket
   */
  sendAudioChunk(connectionId, audioChunk) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection || !connection.connected) return;

    const message = {
      type: 'audio-chunk',
      index: audioChunk.index,
      subIndex: audioChunk.subIndex || 0,
      timestamp: Date.now(),
      originalTimestamp: audioChunk.timestamp,
      priority: audioChunk.priority || 'normal',
      audio: audioChunk.chunk.toString('base64'),
      size: audioChunk.chunk.length
    };

    try {
      connection.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Failed to send WebSocket audio chunk', {
        connectionId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send WebSocket message
   */
  sendWebSocketMessage(connectionId, message) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection || !connection.connected) return;

    try {
      connection.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error('Failed to send WebSocket message', {
        connectionId,
        messageType: message.type,
        error: error.message
      });
    }
  }

  /**
   * Update connection metrics
   */
  updateConnectionMetrics(connectionId, chunkLatency) {
    const metrics = this.connectionMetrics.get(connectionId);
    if (!metrics) return;

    metrics.totalChunks++;
    metrics.avgChunkLatency = (metrics.avgChunkLatency + chunkLatency) / 2;
  }

  /**
   * Handle WebSocket connection close
   */
  handleWebSocketClose(connectionId, code, reason) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) return;

    connection.connected = false;
    const duration = Date.now() - connection.startTime;

    logger.info('WebSocket connection closed', {
      connectionId,
      callSid: connection.callSid,
      code,
      reason: reason.toString(),
      duration,
      chunksStreamed: connection.chunksStreamed,
      bytesStreamed: connection.bytesStreamed
    });

    // Cleanup
    this.activeConnections.delete(connectionId);
    this.connectionMetrics.delete(connectionId);
  }

  /**
   * Handle WebSocket errors
   */
  handleWebSocketError(connectionId, error) {
    const connection = this.activeConnections.get(connectionId);
    
    logger.error('WebSocket error', {
      connectionId,
      callSid: connection?.callSid,
      error: error.message,
      code: error.code
    });

    if (connection) {
      connection.connected = false;
      this.connectionMetrics.get(connectionId).errors++;
    }
  }

  /**
   * Get WebSocket streaming metrics
   */
  getStreamingMetrics() {
    const totalConnections = this.activeConnections.size;
    const metrics = Array.from(this.connectionMetrics.values());
    
    const avgLatency = metrics.length > 0 ? 
      metrics.reduce((sum, m) => sum + m.avgChunkLatency, 0) / metrics.length : 0;
    
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    
    return {
      activeConnections: totalConnections,
      averageChunkLatency: Math.round(avgLatency * 100) / 100,
      totalErrors,
      errorRate: metrics.length > 0 ? (totalErrors / metrics.length) * 100 : 0,
      pollingInterval: CONFIG.REALTIME_POLLING_INTERVAL
    };
  }

  /**
   * Close all WebSocket connections
   */
  closeAllConnections() {
    for (const [connectionId, connection] of this.activeConnections.entries()) {
      try {
        connection.ws.close(1001, 'Server shutdown');
      } catch (error) {
        logger.error('Error closing WebSocket connection', {
          connectionId,
          error: error.message
        });
      }
    }
    
    this.activeConnections.clear();
    this.connectionMetrics.clear();
    
    logger.info('All WebSocket connections closed');
  }
}

export default WebSocketStreamingService;