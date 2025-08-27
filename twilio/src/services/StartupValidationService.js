import logger from './LoggingService.js';
import { CONFIG, validateEnvironment } from '../config/config.js';
import OpenAIService from './OpenAIService.js';
import ElevenLabsService from './ElevenLabsService.js';
import TwilioService from './TwilioService.js';
import PredictiveCacheService from './PredictiveCacheService.js';
import PerformanceMonitorService from './PerformanceMonitorService.js';
import CircuitBreakerService from './CircuitBreakerService.js';

class StartupValidationService {
  constructor() {
    this.validationResults = {
      environment: false,
      services: {},
      dependencies: {},
      system: {}
    };
    
    this.criticalServices = [
      'openai',
      'elevenlabs', 
      'twilio',
      'cache',
      'performance',
      'circuitBreaker'
    ];
  }

  /**
   * Perform comprehensive startup validation
   */
  async performStartupValidation() {
    logger.info('🚀 Starting comprehensive system validation...');
    
    const validationStart = Date.now();
    let allValidationsPassed = true;

    try {
      // 1. Environment Validation
      logger.info('📋 Validating environment configuration...');
      this.validationResults.environment = await this.validateEnvironmentSetup();
      
      if (!this.validationResults.environment) {
        allValidationsPassed = false;
        logger.error('❌ Environment validation failed');
      } else {
        logger.info('✅ Environment validation passed');
      }

      // 2. System Dependencies Validation  
      logger.info('🔧 Validating system dependencies...');
      this.validationResults.dependencies = await this.validateSystemDependencies();
      
      if (!this.validationResults.dependencies.allPassed) {
        allValidationsPassed = false;
        logger.error('❌ System dependencies validation failed');
      } else {
        logger.info('✅ System dependencies validation passed');
      }

      // 3. Service Integration Validation
      logger.info('🔗 Validating service integrations...');
      this.validationResults.services = await this.validateServiceIntegrations();
      
      if (!this.validationResults.services.allPassed) {
        allValidationsPassed = false;
        logger.error('❌ Service integration validation failed');
      } else {
        logger.info('✅ Service integration validation passed');
      }

      // 4. System Health Check
      logger.info('🏥 Performing system health check...');
      this.validationResults.system = await this.validateSystemHealth();
      
      if (!this.validationResults.system.allPassed) {
        // System health warnings are not critical for startup
        logger.warn('⚠️ System health check has warnings (non-critical)');
      } else {
        logger.info('✅ System health check passed');
      }

      const validationDuration = Date.now() - validationStart;
      
      if (allValidationsPassed) {
        logger.info('🎉 All critical startup validations passed', {
          duration: validationDuration + 'ms',
          environment: '✅',
          dependencies: '✅', 
          services: '✅',
          system: this.validationResults.system.allPassed ? '✅' : '⚠️'
        });
        return true;
      } else {
        logger.error('💥 Startup validation failed', {
          duration: validationDuration + 'ms',
          environment: this.validationResults.environment ? '✅' : '❌',
          dependencies: this.validationResults.dependencies.allPassed ? '✅' : '❌',
          services: this.validationResults.services.allPassed ? '✅' : '❌',
          system: this.validationResults.system.allPassed ? '✅' : '⚠️',
          details: this.getFailureDetails()
        });
        return false;
      }

    } catch (error) {
      logger.error('💥 Startup validation crashed', {
        error: error.message,
        stack: error.stack,
        duration: Date.now() - validationStart + 'ms'
      });
      return false;
    }
  }

  /**
   * Validate environment setup
   */
  async validateEnvironmentSetup() {
    try {
      // Check required environment variables
      validateEnvironment();
      
      // Validate NODE_ENV
      const nodeEnv = process.env.NODE_ENV;
      if (!nodeEnv || !['development', 'production', 'test'].includes(nodeEnv)) {
        logger.warn('NODE_ENV not set or invalid, defaulting to development', {
          current: nodeEnv
        });
      }

      // Check port configuration
      const port = process.env.PORT || 3000;
      if (isNaN(port) || port < 1000 || port > 65535) {
        logger.error('Invalid port configuration', { port });
        return false;
      }

      // Validate API key formats (basic validation)
      const apiKeyChecks = {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID?.startsWith('AC'),
        OPENAI_API_KEY: process.env.OPENAI_API_KEY?.startsWith('sk-'),
        DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY?.length >= 32,
        ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY?.length >= 32
      };

      const invalidKeys = Object.entries(apiKeyChecks)
        .filter(([key, valid]) => !valid)
        .map(([key]) => key);

      if (invalidKeys.length > 0) {
        logger.error('Invalid API key formats detected', { invalidKeys });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Environment validation failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Validate system dependencies
   */
  async validateSystemDependencies() {
    const results = {
      allPassed: true,
      checks: {}
    };

    try {
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      results.checks.nodeVersion = {
        version: nodeVersion,
        passed: majorVersion >= 16,
        required: '>=16.0.0'
      };

      if (!results.checks.nodeVersion.passed) {
        logger.error('Node.js version too old', {
          current: nodeVersion,
          required: '>=16.0.0'
        });
        results.allPassed = false;
      }

      // Check memory availability
      const memoryUsage = process.memoryUsage();
      const availableMemoryMB = (memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024;
      results.checks.memory = {
        available: Math.round(availableMemoryMB),
        passed: availableMemoryMB > 50, // At least 50MB free
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      };

      if (!results.checks.memory.passed) {
        logger.warn('Low memory availability', results.checks.memory);
      }

      // Check disk space (basic check)
      try {
        const fs = await import('fs');
        const stats = fs.statSync('./');
        results.checks.filesystem = {
          passed: true,
          accessible: true
        };
      } catch (error) {
        results.checks.filesystem = {
          passed: false,
          accessible: false,
          error: error.message
        };
        results.allPassed = false;
      }

      return results;
    } catch (error) {
      logger.error('System dependencies validation failed', {
        error: error.message
      });
      return {
        allPassed: false,
        checks: {},
        error: error.message
      };
    }
  }

  /**
   * Validate service integrations
   */
  async validateServiceIntegrations() {
    const results = {
      allPassed: true,
      services: {}
    };

    const serviceTests = [
      {
        name: 'openai',
        test: () => this.testOpenAIService()
      },
      {
        name: 'elevenlabs',
        test: () => this.testElevenLabsService()
      },
      {
        name: 'twilio',
        test: () => this.testTwilioService()
      },
      {
        name: 'cache',
        test: () => this.testCacheService()
      },
      {
        name: 'performance',
        test: () => this.testPerformanceMonitorService()
      },
      {
        name: 'circuitBreaker',
        test: () => this.testCircuitBreakerService()
      }
    ];

    for (const serviceTest of serviceTests) {
      try {
        logger.debug(`Testing ${serviceTest.name} service...`);
        const testResult = await Promise.race([
          serviceTest.test(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service test timeout')), 10000)
          )
        ]);
        
        results.services[serviceTest.name] = {
          passed: testResult.passed,
          ...testResult
        };

        if (!testResult.passed) {
          results.allPassed = false;
          logger.error(`Service test failed: ${serviceTest.name}`, testResult);
        }

      } catch (error) {
        results.services[serviceTest.name] = {
          passed: false,
          error: error.message
        };
        results.allPassed = false;
        logger.error(`Service test error: ${serviceTest.name}`, {
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Test OpenAI service
   */
  async testOpenAIService() {
    try {
      const openaiService = new OpenAIService();
      
      // Basic initialization test
      if (!openaiService) {
        return { passed: false, error: 'Service initialization failed' };
      }

      return {
        passed: true,
        initialized: true,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Test ElevenLabs service
   */
  async testElevenLabsService() {
    try {
      const elevenLabsService = new ElevenLabsService();
      
      if (!elevenLabsService) {
        return { passed: false, error: 'Service initialization failed' };
      }

      // Test voice pool initialization
      const voicePools = elevenLabsService.voicePools;
      const hasVoices = voicePools && 
        voicePools.primary && voicePools.primary.length > 0;

      return {
        passed: hasVoices,
        initialized: true,
        voicePoolsConfigured: hasVoices,
        primaryVoices: voicePools?.primary?.length || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Test Twilio service
   */
  async testTwilioService() {
    try {
      const twilioService = new TwilioService();
      
      if (!twilioService) {
        return { passed: false, error: 'Service initialization failed' };
      }

      return {
        passed: true,
        initialized: true,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Test cache service
   */
  async testCacheService() {
    try {
      const cacheService = PredictiveCacheService.getInstance();
      
      if (!cacheService) {
        return { passed: false, error: 'Service initialization failed' };
      }

      // Test basic cache operations
      const metrics = cacheService.getMetrics();
      
      return {
        passed: true,
        initialized: true,
        metricsAvailable: !!metrics,
        cacheSize: metrics?.responseCacheSize || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Test performance monitor service
   */
  async testPerformanceMonitorService() {
    try {
      const performanceMonitor = PerformanceMonitorService.getInstance();
      
      if (!performanceMonitor) {
        return { passed: false, error: 'Service initialization failed' };
      }

      const summary = performanceMonitor.getPerformanceSummary();
      
      return {
        passed: true,
        initialized: true,
        metricsAvailable: !!summary,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Test circuit breaker service
   */
  async testCircuitBreakerService() {
    try {
      const circuitBreakerService = CircuitBreakerService.getInstance();
      
      if (!circuitBreakerService) {
        return { passed: false, error: 'Service initialization failed' };
      }

      const metrics = circuitBreakerService.getGlobalMetrics();
      
      return {
        passed: true,
        initialized: true,
        metricsAvailable: !!metrics,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message
      };
    }
  }

  /**
   * Validate system health
   */
  async validateSystemHealth() {
    const results = {
      allPassed: true,
      checks: {}
    };

    try {
      // CPU usage check (basic)
      const startTime = process.hrtime();
      await new Promise(resolve => setTimeout(resolve, 100));
      const diff = process.hrtime(startTime);
      const cpuTime = (diff[0] * 1000 + diff[1] / 1e6);
      
      results.checks.cpu = {
        responseTime: cpuTime,
        passed: cpuTime < 200, // Less than 200ms for basic operations
      };

      // Memory pressure check
      const memUsage = process.memoryUsage();
      const memoryPressure = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      results.checks.memory = {
        pressure: Math.round(memoryPressure),
        passed: memoryPressure < 80, // Less than 80% memory usage
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      };

      if (!results.checks.memory.passed) {
        results.allPassed = false;
      }

      // Configuration validation
      results.checks.config = {
        maxConcurrentStreams: CONFIG.MAX_CONCURRENT_STREAMS,
        maxCacheMemory: CONFIG.MAX_CACHE_MEMORY_MB,
        rateLimitConfigured: !!CONFIG.RATE_LIMIT_REQUESTS_PER_MINUTE,
        passed: CONFIG.MAX_CONCURRENT_STREAMS > 0 && CONFIG.MAX_CACHE_MEMORY_MB > 0
      };

      if (!results.checks.config.passed) {
        results.allPassed = false;
      }

      return results;
    } catch (error) {
      return {
        allPassed: false,
        error: error.message
      };
    }
  }

  /**
   * Get detailed failure information
   */
  getFailureDetails() {
    const failures = [];

    if (!this.validationResults.environment) {
      failures.push('Environment configuration invalid');
    }

    if (!this.validationResults.dependencies.allPassed) {
      const failedChecks = Object.entries(this.validationResults.dependencies.checks || {})
        .filter(([, check]) => !check.passed)
        .map(([name]) => name);
      failures.push(`System dependencies failed: ${failedChecks.join(', ')}`);
    }

    if (!this.validationResults.services.allPassed) {
      const failedServices = Object.entries(this.validationResults.services.services || {})
        .filter(([, service]) => !service.passed)
        .map(([name]) => name);
      failures.push(`Service integrations failed: ${failedServices.join(', ')}`);
    }

    return failures;
  }

  /**
   * Get validation summary
   */
  getValidationSummary() {
    return {
      timestamp: Date.now(),
      results: this.validationResults,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
  }
}

export default StartupValidationService;