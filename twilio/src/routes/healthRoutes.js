import express from 'express';
import DatabaseService from '../services/DatabaseService.js';
import CallSessionManager from '../services/CallSessionManager.js';
import logger from '../services/LoggingService.js';
import { webhookRateLimiter } from '../middleware/rateLimiter.js';

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

// Detailed health check with dependencies
router.get('/health/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
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

    // Determine overall health
    const unhealthyServices = Object.values(health.services)
      .filter(service => service.status !== 'healthy');
    
    if (unhealthyServices.length > 0) {
      health.status = 'degraded';
      res.status(503);
    }

    res.json(health);
  } catch (error) {
    logger.logError(error, { endpoint: '/health/detailed' });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
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