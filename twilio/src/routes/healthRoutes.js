import express from 'express';
import DatabaseService from '../services/DatabaseService.js';
import CallSessionManager from '../services/CallSessionManager.js';
import StreamingPipelineService from '../services/StreamingPipelineService.js';
import CircuitBreakerService from '../services/CircuitBreakerService.js';
import PerformanceMonitorService from '../services/PerformanceMonitorService.js';
import PredictiveCacheService from '../services/PredictiveCacheService.js';
import StartupValidationService from '../services/StartupValidationService.js';
import logger from '../services/LoggingService.js';
import { webhookRateLimiter } from '../middleware/rateLimiter.js';
import { CONFIG } from '../config/config.js';

const router = express.Router();

// Basic health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    logger.logError(error, { endpoint: '/health' });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Production-ready detailed health check
router.get('/health/detailed', async (req, res) => {
  try {
    const streamingPipeline = StreamingPipelineService.getInstance();
    const circuitBreakerService = CircuitBreakerService.getInstance();
    const performanceMonitor = PerformanceMonitorService.getInstance();
    const cacheService = PredictiveCacheService.getInstance();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {}
    };

    // Check database connection
    try {
      const dbHealthy = await DatabaseService.healthCheck();
      health.services.database = {
        status: dbHealthy ? 'healthy' : 'unhealthy',
        message: dbHealthy ? 'Connected' : 'Connection failed'
      };
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check streaming pipeline
    try {
      const systemHealth = streamingPipeline.getSystemHealth();
      health.services.streaming = {
        status: systemHealth.isHealthy ? 'healthy' : 'unhealthy',
        activeStreams: systemHealth.activeStreams,
        errorRecovery: systemHealth.errorRecovery,
        serviceStates: systemHealth.services
      };
    } catch (error) {
      health.services.streaming = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check circuit breakers
    try {
      const cbMetrics = circuitBreakerService.getGlobalMetrics();
      health.services.circuitBreakers = {
        status: cbMetrics.global.healthScore > 50 ? 'healthy' : 'unhealthy',
        healthScore: cbMetrics.global.healthScore,
        totalServices: cbMetrics.global.totalServices,
        healthyServices: cbMetrics.global.healthyServices,
        unhealthyServices: cbMetrics.global.unhealthyServices
      };
    } catch (error) {
      health.services.circuitBreakers = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check performance monitor
    try {
      const perfSummary = performanceMonitor.getPerformanceSummary();
      health.services.performance = {
        status: perfSummary.systemHealth.overall === 'excellent' || 
                perfSummary.systemHealth.overall === 'good' ? 'healthy' : 'degraded',
        totalResponses: perfSummary.totalResponses,
        avgLatency: perfSummary.latency.avgResponse,
        healthScore: perfSummary.systemHealth.score
      };
    } catch (error) {
      health.services.performance = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check cache service
    try {
      const cacheMetrics = cacheService.getMetrics();
      health.services.cache = {
        status: 'healthy',
        hitRate: cacheMetrics.hitRate,
        responseCacheSize: cacheMetrics.responseCacheSize,
        audioCacheSize: cacheMetrics.audioCacheSize,
        memoryUsage: cacheMetrics.totalMemoryUsage
      };
    } catch (error) {
      health.services.cache = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check call session manager
    try {
      const metrics = CallSessionManager.getMetrics();
      health.services.callSessions = {
        status: 'healthy',
        activeCalls: metrics.activeCalls,
        totalCalls: metrics.totalCalls,
        completedCalls: metrics.completedCalls,
        failedCalls: metrics.failedCalls
      };
    } catch (error) {
      health.services.callSessions = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Check rate limiter stats
    try {
      const rateLimiterStats = webhookRateLimiter.getStats();
      health.services.rateLimiter = {
        status: 'healthy',
        ...rateLimiterStats
      };
    } catch (error) {
      health.services.rateLimiter = {
        status: 'unhealthy',
        message: error.message
      };
    }

    // Add resource monitoring
    const memory = process.memoryUsage();
    const memoryPressure = (memory.heapUsed / memory.heapTotal) * 100;
    
    health.resources = {
      memory: {
        usage: memory,
        pressure: Math.round(memoryPressure),
        status: memoryPressure < 80 ? 'healthy' : 'warning'
      },
      cpu: process.cpuUsage()
    };

    // Determine overall health
    const unhealthyServices = Object.values(health.services)
      .filter(service => service.status === 'unhealthy');
    
    const degradedServices = Object.values(health.services)
      .filter(service => service.status === 'degraded');
    
    if (unhealthyServices.length > 0) {
      health.status = 'unhealthy';
      res.status(503);
    } else if (degradedServices.length > 0 || memoryPressure > 80) {
      health.status = 'degraded';
      res.status(200); // Still operational but degraded
    }

    res.json(health);

    logger.debug('Detailed health check completed', {
      status: health.status,
      unhealthyServices: unhealthyServices.length,
      degradedServices: degradedServices.length,
      ip: req.ip
    });

  } catch (error) {
    logger.logError(error, { endpoint: '/health/detailed' });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      calls: CallSessionManager.getMetrics(),
      rateLimiter: webhookRateLimiter.getStats(),
      process: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    };

    res.json(metrics);
  } catch (error) {
    logger.logError(error, { endpoint: '/metrics' });
    res.status(500).json({
      error: error.message
    });
  }
});

// Ready endpoint for k8s readiness probes
router.get('/ready', async (req, res) => {
  try {
    // Check if critical services are ready
    const dbHealthy = await DatabaseService.healthCheck();
    
    if (!dbHealthy) {
      return res.status(503).json({
        ready: false,
        reason: 'Database not ready'
      });
    }

    res.json({ ready: true });
  } catch (error) {
    logger.logError(error, { endpoint: '/ready' });
    res.status(503).json({
      ready: false,
      reason: error.message
    });
  }
});

export default router;