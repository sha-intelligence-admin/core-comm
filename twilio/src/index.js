// index.js - Clean version without Express-WS
import express from 'express';
import 'dotenv/config';
import { initializeWebSocket } from './websocket.js';
import { createClient } from '@deepgram/sdk';
import http from 'http';
import logger from './services/LoggingService.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

const app = express();
const server = http.createServer(app);

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(generalRateLimiter.middleware());

const PORT = process.env.PORT || 3000;

// Routes
import callRoutes from './routes/callRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import audioRoutes from './routes/audioRoutes.js';

app.use('/api/calls', callRoutes);
app.use('/api', healthRoutes);
app.use('/api/audio', audioRoutes);

// Initialize native WebSocket server
initializeWebSocket(server, deepgram);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    phoneNumber: process.env.TWILIO_PHONE_NUMBER 
  });
  logger.info('Speech recognition enabled');
  logger.info('Health check available at /api/health');
});