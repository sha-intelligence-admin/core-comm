import logger from './LoggingService.js';
import { CONFIG } from '../config/config.js';

class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || CONFIG.CIRCUIT_BREAKER_THRESHOLD;
    this.timeout = options.timeout || CONFIG.CIRCUIT_BREAKER_TIMEOUT;
    this.monitoringPeriod = options.monitoringPeriod || 60000; // 1 minute
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.totalRequests = 0;
    
    // Monitoring
    this.stateChangeListeners = [];
    this.metrics = {
      totalFailures: 0,
      totalSuccesses: 0,
      circuitOpenCount: 0,
      averageResponseTime: 0,
      lastStateChange: Date.now()
    };
  }

  async call(operation, fallback = null) {
    this.totalRequests++;
    
    if (this.state === 'OPEN') {
      if (this.canAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.notifyStateChange('HALF_OPEN');
        logger.info('Circuit breaker transitioning to HALF_OPEN', {
          service: this.serviceName
        });
      } else {
        this.recordFailure(new Error('Circuit breaker is OPEN'));
        if (fallback) {
          logger.debug('Using fallback due to open circuit', {
            service: this.serviceName
          });
          return await fallback();
        }
        throw new Error(`Circuit breaker is OPEN for service: ${this.serviceName}`);
      }
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      this.recordSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.recordFailure(error, Date.now() - startTime);
      
      if (fallback) {
        logger.warn('Operation failed, using fallback', {
          service: this.serviceName,
          error: error.message
        });
        return await fallback();
      }
      
      throw error;
    }
  }

  recordSuccess(responseTime = 0) {
    this.successCount++;
    this.metrics.totalSuccesses++;
    this.updateAverageResponseTime(responseTime);
    
    if (this.state === 'HALF_OPEN') {
      this.reset();
    } else if (this.state === 'CLOSED') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
    
    logger.debug('Circuit breaker recorded success', {
      service: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      responseTime
    });
  }

  recordFailure(error, responseTime = 0) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.metrics.totalFailures++;
    this.updateAverageResponseTime(responseTime);
    
    if (this.failureCount >= this.failureThreshold) {
      this.trip();
    }
    
    logger.warn('Circuit breaker recorded failure', {
      service: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.failureThreshold,
      error: error.message,
      responseTime
    });
  }

  trip() {
    if (this.state !== 'OPEN') {
      this.state = 'OPEN';
      this.metrics.circuitOpenCount++;
      this.notifyStateChange('OPEN');
      
      logger.error('Circuit breaker OPENED', {
        service: this.serviceName,
        failureCount: this.failureCount,
        threshold: this.failureThreshold
      });
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.notifyStateChange('CLOSED');
    
    logger.info('Circuit breaker CLOSED (reset)', {
      service: this.serviceName
    });
  }

  canAttemptReset() {
    return Date.now() - this.lastFailureTime >= this.timeout;
  }

  updateAverageResponseTime(responseTime) {
    const totalResponses = this.metrics.totalSuccesses + this.metrics.totalFailures;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;
  }

  notifyStateChange(newState) {
    this.metrics.lastStateChange = Date.now();
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.serviceName, newState, this.state);
      } catch (error) {
        logger.error('Error in circuit breaker state change listener', {
          service: this.serviceName,
          error: error.message
        });
      }
    });
  }

  onStateChange(listener) {
    this.stateChangeListeners.push(listener);
  }

  getMetrics() {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      failureRate: this.totalRequests > 0 ? 
        (this.metrics.totalFailures / this.totalRequests) * 100 : 0,
      ...this.metrics
    };
  }

  healthCheck() {
    const now = Date.now();
    const isHealthy = this.state === 'CLOSED' || 
      (this.state === 'HALF_OPEN' && this.successCount > 0);
    
    return {
      service: this.serviceName,
      healthy: isHealthy,
      state: this.state,
      failureRate: this.getMetrics().failureRate,
      lastStateChange: now - this.metrics.lastStateChange,
      timestamp: now
    };
  }
}

class CircuitBreakerService {
  constructor() {
    this.circuitBreakers = new Map();
    this.globalMetrics = {
      totalServices: 0,
      healthyServices: 0,
      degradedServices: 0,
      unhealthyServices: 0
    };
    
    // Global state change listener
    this.onGlobalStateChange = (serviceName, newState, oldState) => {
      logger.info('Global circuit breaker state change', {
        service: serviceName,
        from: oldState,
        to: newState
      });
    };
    
    // Periodic health check
    setInterval(() => {
      this.performGlobalHealthCheck();
    }, CONFIG.HEALTH_CHECK_INTERVAL);
  }

  static getInstance() {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  getCircuitBreaker(serviceName, options = {}) {
    if (!this.circuitBreakers.has(serviceName)) {
      const circuitBreaker = new CircuitBreaker(serviceName, options);
      circuitBreaker.onStateChange(this.onGlobalStateChange);
      this.circuitBreakers.set(serviceName, circuitBreaker);
      
      logger.info('Circuit breaker created', {
        service: serviceName,
        threshold: circuitBreaker.failureThreshold,
        timeout: circuitBreaker.timeout
      });
    }
    
    return this.circuitBreakers.get(serviceName);
  }

  async executeWithCircuitBreaker(serviceName, operation, fallback = null, options = {}) {
    const circuitBreaker = this.getCircuitBreaker(serviceName, options);
    return await circuitBreaker.call(operation, fallback);
  }

  performGlobalHealthCheck() {
    let healthy = 0;
    let degraded = 0;
    let unhealthy = 0;
    
    for (const [serviceName, circuitBreaker] of this.circuitBreakers.entries()) {
      const health = circuitBreaker.healthCheck();
      
      if (health.healthy && health.state === 'CLOSED') {
        healthy++;
      } else if (health.state === 'HALF_OPEN') {
        degraded++;
      } else {
        unhealthy++;
      }
    }
    
    this.globalMetrics = {
      totalServices: this.circuitBreakers.size,
      healthyServices: healthy,
      degradedServices: degraded,
      unhealthyServices: unhealthy,
      healthScore: this.circuitBreakers.size > 0 ? 
        (healthy / this.circuitBreakers.size) * 100 : 100
    };
    
    if (unhealthy > 0) {
      logger.warn('Circuit breaker global health check', {
        ...this.globalMetrics,
        timestamp: Date.now()
      });
    } else {
      logger.debug('Circuit breaker global health check', {
        ...this.globalMetrics,
        timestamp: Date.now()
      });
    }
  }

  getGlobalMetrics() {
    const serviceMetrics = {};
    for (const [serviceName, circuitBreaker] of this.circuitBreakers.entries()) {
      serviceMetrics[serviceName] = circuitBreaker.getMetrics();
    }
    
    return {
      global: this.globalMetrics,
      services: serviceMetrics,
      timestamp: Date.now()
    };
  }

  resetCircuitBreaker(serviceName) {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.reset();
      logger.info('Circuit breaker manually reset', { service: serviceName });
      return true;
    }
    return false;
  }

  resetAllCircuitBreakers() {
    let resetCount = 0;
    for (const [serviceName, circuitBreaker] of this.circuitBreakers.entries()) {
      circuitBreaker.reset();
      resetCount++;
    }
    
    logger.info('All circuit breakers reset', { count: resetCount });
    return resetCount;
  }
}

export default CircuitBreakerService;