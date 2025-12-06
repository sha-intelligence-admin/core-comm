import logger from './LoggingService.js';
import { CONFIG } from '../config/config.js';

class PerformanceMonitorService {
  constructor() {
    this.metrics = {
      responseLatency: [],
      audioGenerationTime: [],
      streamingLatency: [],
      cacheHitRatio: [],
      totalResponses: 0,
      cachedResponses: 0,
      streamingResponses: 0,
      fallbackResponses: 0
    };
    
    this.sessionMetrics = new Map();
    this.realtimeMetrics = {
      activeStreams: 0,
      totalBandwidth: 0,
      avgChunkLatency: 0,
      peakLatency: 0,
      errorRate: 0
    };
    
    // Performance targets for comparison
    this.targets = {
      responseLatency: 150, // Target: under 150ms
      audioGeneration: 500, // Target: under 500ms for TTS
      streamingLatency: 50, // Target: under 50ms for streaming
      cacheHitRatio: 30, // Target: 30% cache hit ratio
      errorRate: 1 // Target: under 1% error rate
    };
    
    this.startTime = Date.now();
    this.lastReportTime = Date.now();
    
    // Periodic reporting
    setInterval(() => this.generatePerformanceReport(), 60000); // Every minute
    setInterval(() => this.logRealtimeMetrics(), 10000); // Every 10 seconds
  }

  // Singleton pattern
  static getInstance() {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * Record response performance metrics
   */
  recordResponseMetrics(callSid, metrics) {
    try {
      const {
        totalLatency,
        audioGenerationTime,
        streamingLatency,
        responseType, // 'cached', 'streaming', 'fallback'
        cacheHit = false,
        textLength,
        audioSize,
        chunkCount = 0
      } = metrics;

      // Update global metrics
      if (totalLatency) {
        this.metrics.responseLatency.push(totalLatency);
        this.keepRecentMetrics(this.metrics.responseLatency, 1000);
      }

      if (audioGenerationTime) {
        this.metrics.audioGenerationTime.push(audioGenerationTime);
        this.keepRecentMetrics(this.metrics.audioGenerationTime, 1000);
      }

      if (streamingLatency) {
        this.metrics.streamingLatency.push(streamingLatency);
        this.keepRecentMetrics(this.metrics.streamingLatency, 1000);
      }

      // Update response type counters
      this.metrics.totalResponses++;
      if (responseType === 'cached') {
        this.metrics.cachedResponses++;
      } else if (responseType === 'streaming') {
        this.metrics.streamingResponses++;
      } else if (responseType === 'fallback') {
        this.metrics.fallbackResponses++;
      }

      // Update session-specific metrics
      if (!this.sessionMetrics.has(callSid)) {
        this.sessionMetrics.set(callSid, {
          startTime: Date.now(),
          responses: [],
          avgLatency: 0,
          cacheHits: 0,
          totalChunks: 0,
          totalAudioSize: 0
        });
      }

      const sessionData = this.sessionMetrics.get(callSid);
      sessionData.responses.push({
        timestamp: Date.now(),
        latency: totalLatency,
        type: responseType,
        cached: cacheHit,
        textLength,
        audioSize,
        chunkCount
      });

      if (cacheHit) sessionData.cacheHits++;
      if (chunkCount) sessionData.totalChunks += chunkCount;
      if (audioSize) sessionData.totalAudioSize += audioSize;

      // Calculate session average latency
      const latencies = sessionData.responses
        .filter(r => r.latency)
        .map(r => r.latency);
      sessionData.avgLatency = latencies.length > 0 ? 
        latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

      logger.debug('Performance metrics recorded', {
        callSid,
        totalLatency,
        responseType,
        cacheHit,
        sessionAvgLatency: sessionData.avgLatency
      });

    } catch (error) {
      logger.error('Error recording performance metrics', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Record real-time streaming metrics
   */
  recordStreamingMetrics(callSid, metrics) {
    try {
      const {
        chunkLatency,
        chunkSize,
        bufferSize,
        streamingRate,
        error = false
      } = metrics;

      if (chunkLatency) {
        this.realtimeMetrics.avgChunkLatency = 
          (this.realtimeMetrics.avgChunkLatency + chunkLatency) / 2;
        
        if (chunkLatency > this.realtimeMetrics.peakLatency) {
          this.realtimeMetrics.peakLatency = chunkLatency;
        }
      }

      if (streamingRate) {
        this.realtimeMetrics.totalBandwidth += streamingRate;
      }

      if (error) {
        this.realtimeMetrics.errorRate++;
      }

      logger.debug('Streaming metrics recorded', {
        callSid,
        chunkLatency,
        avgLatency: this.realtimeMetrics.avgChunkLatency,
        peakLatency: this.realtimeMetrics.peakLatency
      });

    } catch (error) {
      logger.error('Error recording streaming metrics', {
        callSid,
        error: error.message
      });
    }
  }

  /**
   * Update active stream count
   */
  updateActiveStreams(count) {
    this.realtimeMetrics.activeStreams = count;
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary() {
    try {
      const now = Date.now();
      const uptime = now - this.startTime;
      
      const summary = {
        uptime: this.formatUptime(uptime),
        totalResponses: this.metrics.totalResponses,
        
        // Response distribution
        responseDistribution: {
          cached: this.metrics.cachedResponses,
          streaming: this.metrics.streamingResponses,
          fallback: this.metrics.fallbackResponses,
          cachedPercentage: this.metrics.totalResponses > 0 ? 
            ((this.metrics.cachedResponses / this.metrics.totalResponses) * 100).toFixed(1) + '%' : '0%'
        },
        
        // Latency metrics
        latency: {
          avgResponse: this.calculateAverage(this.metrics.responseLatency),
          p95Response: this.calculatePercentile(this.metrics.responseLatency, 95),
          avgAudioGeneration: this.calculateAverage(this.metrics.audioGenerationTime),
          avgStreaming: this.calculateAverage(this.metrics.streamingLatency),
          peakStreaming: this.realtimeMetrics.peakLatency
        },
        
        // Performance vs targets
        performanceVsTargets: {
          responseLatency: this.compareToTarget('responseLatency'),
          audioGeneration: this.compareToTarget('audioGeneration'),
          streamingLatency: this.compareToTarget('streamingLatency'),
          cacheHitRatio: this.compareToTarget('cacheHitRatio')
        },
        
        // Real-time metrics
        realtime: {
          activeStreams: this.realtimeMetrics.activeStreams,
          avgChunkLatency: Math.round(this.realtimeMetrics.avgChunkLatency * 100) / 100,
          totalBandwidth: this.formatBandwidth(this.realtimeMetrics.totalBandwidth),
          errorRate: this.realtimeMetrics.errorRate
        },
        
        // System performance indicators
        systemHealth: this.assessSystemHealth()
      };

      return summary;
    } catch (error) {
      logger.error('Error generating performance summary', {
        error: error.message
      });
      return { error: 'Failed to generate performance summary' };
    }
  }

  /**
   * Generate detailed session performance report
   */
  getSessionReport(callSid) {
    try {
      const sessionData = this.sessionMetrics.get(callSid);
      if (!sessionData) {
        return { error: 'Session not found' };
      }

      const duration = Date.now() - sessionData.startTime;
      const cacheHitRatio = sessionData.responses.length > 0 ? 
        (sessionData.cacheHits / sessionData.responses.length) * 100 : 0;

      return {
        callSid,
        sessionDuration: this.formatDuration(duration),
        totalResponses: sessionData.responses.length,
        avgLatency: Math.round(sessionData.avgLatency),
        cacheHitRatio: Math.round(cacheHitRatio * 100) / 100 + '%',
        totalChunks: sessionData.totalChunks,
        totalAudioSize: this.formatBytes(sessionData.totalAudioSize),
        responseBreakdown: this.analyzeSessionResponses(sessionData.responses),
        latencyTrend: this.calculateLatencyTrend(sessionData.responses)
      };
    } catch (error) {
      logger.error('Error generating session report', {
        callSid,
        error: error.message
      });
      return { error: 'Failed to generate session report' };
    }
  }

  /**
   * Log real-time performance metrics
   */
  logRealtimeMetrics() {
    try {
      const summary = this.getPerformanceSummary();
      
      logger.info('Real-time Performance Metrics', {
        activeStreams: summary.realtime.activeStreams,
        avgResponseLatency: summary.latency.avgResponse,
        cachedResponsePercentage: summary.responseDistribution.cachedPercentage,
        avgChunkLatency: summary.realtime.avgChunkLatency,
        systemHealth: summary.systemHealth.overall
      });
    } catch (error) {
      logger.error('Error logging real-time metrics', {
        error: error.message
      });
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport() {
    try {
      const summary = this.getPerformanceSummary();
      const timeSinceLastReport = Date.now() - this.lastReportTime;
      
      logger.info('Performance Report Generated', {
        reportInterval: this.formatDuration(timeSinceLastReport),
        uptime: summary.uptime,
        totalResponses: summary.totalResponses,
        avgResponseLatency: summary.latency.avgResponse + 'ms',
        p95ResponseLatency: summary.latency.p95Response + 'ms',
        cachedResponses: summary.responseDistribution.cachedPercentage,
        systemHealth: summary.systemHealth.overall,
        performanceVsTargets: summary.performanceVsTargets
      });

      this.lastReportTime = Date.now();
      
      // Export detailed report for analysis
      this.exportDetailedReport(summary);
      
    } catch (error) {
      logger.error('Error generating performance report', {
        error: error.message
      });
    }
  }

  /**
   * Export detailed report to file (for analysis)
   */
  exportDetailedReport(summary) {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        summary,
        rawMetrics: {
          responseLatency: this.metrics.responseLatency.slice(-100), // Last 100
          audioGenerationTime: this.metrics.audioGenerationTime.slice(-100),
          streamingLatency: this.metrics.streamingLatency.slice(-100)
        },
        sessionCount: this.sessionMetrics.size,
        config: {
          streamingEnabled: CONFIG.ENABLE_STREAMING_PIPELINE,
          cachingEnabled: CONFIG.ENABLE_PREDICTIVE_CACHING,
          textChunkMinLength: CONFIG.TEXT_CHUNK_MIN_LENGTH,
          realtimePolling: CONFIG.REALTIME_POLLING_INTERVAL
        }
      };

      // In a production environment, you might want to write this to a file or send to a monitoring service
      logger.debug('Performance report exported', {
        reportSize: JSON.stringify(reportData).length,
        sessionsCovered: this.sessionMetrics.size
      });

    } catch (error) {
      logger.error('Error exporting detailed report', {
        error: error.message
      });
    }
  }

  /**
   * Assess overall system health
   */
  assessSystemHealth() {
    try {
      const avgLatency = this.calculateAverage(this.metrics.responseLatency);
      const cacheHitRatio = this.metrics.totalResponses > 0 ? 
        (this.metrics.cachedResponses / this.metrics.totalResponses) * 100 : 0;
      
      const healthScores = {
        latency: avgLatency < this.targets.responseLatency ? 'good' : 
                avgLatency < this.targets.responseLatency * 1.5 ? 'fair' : 'poor',
        caching: cacheHitRatio >= this.targets.cacheHitRatio ? 'good' :
                cacheHitRatio >= this.targets.cacheHitRatio * 0.7 ? 'fair' : 'poor',
        streaming: this.realtimeMetrics.avgChunkLatency < this.targets.streamingLatency ? 'good' :
                  this.realtimeMetrics.avgChunkLatency < this.targets.streamingLatency * 2 ? 'fair' : 'poor',
        errors: this.realtimeMetrics.errorRate < this.targets.errorRate ? 'good' : 'poor'
      };

      const goodCount = Object.values(healthScores).filter(score => score === 'good').length;
      const overall = goodCount >= 3 ? 'excellent' : goodCount >= 2 ? 'good' : 'needs-attention';

      return {
        overall,
        details: healthScores,
        score: `${goodCount}/4`
      };
    } catch (error) {
      return { overall: 'unknown', error: error.message };
    }
  }

  /**
   * Helper methods
   */
  calculateAverage(values) {
    if (!values || values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  calculatePercentile(values, percentile) {
    if (!values || values.length === 0) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  compareToTarget(metric) {
    const current = this.calculateAverage(this.metrics[metric] || []);
    const target = this.targets[metric];
    
    if (metric === 'cacheHitRatio') {
      const actualRatio = this.metrics.totalResponses > 0 ? 
        (this.metrics.cachedResponses / this.metrics.totalResponses) * 100 : 0;
      return {
        current: Math.round(actualRatio * 100) / 100 + '%',
        target: target + '%',
        status: actualRatio >= target ? 'meeting' : 'below'
      };
    }
    
    return {
      current: current + 'ms',
      target: target + 'ms',
      status: current <= target ? 'meeting' : 'exceeding'
    };
  }

  keepRecentMetrics(array, maxSize) {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize);
    }
  }

  formatUptime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatBandwidth(bytesPerSecond) {
    return this.formatBytes(bytesPerSecond) + '/s';
  }

  analyzeSessionResponses(responses) {
    const types = responses.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return types;
  }

  calculateLatencyTrend(responses) {
    if (responses.length < 2) return 'insufficient-data';
    
    const recentLatencies = responses
      .filter(r => r.latency)
      .slice(-5)
      .map(r => r.latency);
    
    if (recentLatencies.length < 2) return 'insufficient-data';
    
    const firstHalf = recentLatencies.slice(0, Math.floor(recentLatencies.length / 2));
    const secondHalf = recentLatencies.slice(Math.floor(recentLatencies.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 10) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Clear session metrics (cleanup)
   */
  clearSessionMetrics(callSid) {
    this.sessionMetrics.delete(callSid);
    logger.debug('Session metrics cleared', { callSid });
  }

  /**
   * Reset all metrics (for testing)
   */
  resetMetrics() {
    this.metrics = {
      responseLatency: [],
      audioGenerationTime: [],
      streamingLatency: [],
      cacheHitRatio: [],
      totalResponses: 0,
      cachedResponses: 0,
      streamingResponses: 0,
      fallbackResponses: 0
    };
    
    this.sessionMetrics.clear();
    this.realtimeMetrics = {
      activeStreams: 0,
      totalBandwidth: 0,
      avgChunkLatency: 0,
      peakLatency: 0,
      errorRate: 0
    };
    
    this.startTime = Date.now();
    logger.info('Performance metrics reset');
  }
}

export default PerformanceMonitorService;