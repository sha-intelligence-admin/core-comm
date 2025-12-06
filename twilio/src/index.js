// index.js - Production-ready startup
import express from 'express';
import 'dotenv/config';
import { initializeWebSocket } from './websocket.js';
import { createClient } from '@deepgram/sdk';
import http from 'http';
import logger from './services/LoggingService.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { validateEnvironment, CONFIG } from './config/config.js';
import StartupValidationService from './services/StartupValidationService.js';

// Production startup sequence
async function startServer() {
  try {
    // 1. Validate environment first
    logger.info('🚀 Starting Sha Intelligence Voice Agent...');
    logger.info(`📋 Environment: ${CONFIG.NODE_ENV}`);
    logger.info(`📊 Log Level: ${CONFIG.LOG_LEVEL}`);
    
    validateEnvironment();
    
    // 2. Initialize services
    logger.info('🔧 Initializing services...');
    const validationService = new StartupValidationService();
    const validationPassed = await validationService.performStartupValidation();
    
    if (!validationPassed) {
      logger.error('💥 Startup validation failed, exiting...');
      process.exit(1);
    }
    
    // 3. Initialize Express app
    const app = express();
    const server = http.createServer(app);
    
    // 4. Initialize external services
    let deepgram;
    try {
      deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      logger.info('✅ Deepgram client initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Deepgram client', {
        error: error.message
      });
      throw error;
    }

    // 5. Setup middleware
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(generalRateLimiter.middleware());
    
    const PORT = process.env.PORT || 3000;

    // 6. Setup routes
    const { default: callRoutes } = await import('./routes/callRoutes.js');
    const { default: healthRoutes } = await import('./routes/healthRoutes.js');
    const { default: audioRoutes } = await import('./routes/audioRoutes.js');
    const { default: audioStreamRoutes } = await import('./routes/audioStreamRoutes.js');

    app.use('/api/calls', callRoutes);
    app.use('/api', healthRoutes);
    app.use('/api/audio', audioRoutes);
    app.use('/api/audio', audioStreamRoutes);

    // 7. Initialize WebSocket server
    logger.info('🌐 Initializing WebSocket server...');
    try {
      await initializeWebSocket(server, deepgram);
      logger.info('✅ WebSocket server initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize WebSocket server', {
        error: error.message
      });
      throw error;
    }

    // 8. Setup graceful shutdown
    setupGracefulShutdown(server);

    // 9. Start server
    await new Promise((resolve, reject) => {
      server.listen(PORT, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    logger.info('🎉 Server successfully started!', { 
      port: PORT,
      environment: CONFIG.NODE_ENV,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured',
      healthEndpoint: `/api/health`,
      metricsEndpoint: `/api/metrics`
    });
    
    logger.info('✅ Speech recognition enabled');
    logger.info('✅ Ultra-low latency streaming enabled');
    logger.info('✅ All systems operational');

  } catch (error) {
    logger.emergency('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    
    // Exit with error code
    process.exit(1);
  }
}

// Setup graceful shutdown handling
function setupGracefulShutdown(server) {
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    
    server.close(async () => {
      try {
        // Cleanup resources
        logger.info('🛑 Server stopped accepting new connections');
        
        // Give existing connections time to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        logger.info('✅ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', {
          error: error.message
        });
        process.exit(1);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('⏰ Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.emergency('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.emergency('Unhandled promise rejection', {
      reason: reason?.toString(),
      promise: promise?.toString()
    });
    process.exit(1);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('💥 Critical startup error:', error.message);
  process.exit(1);
});