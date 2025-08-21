import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { initializeWebSocket } from './websocket.js';
import { createClient } from '@deepgram/sdk';
import http from 'http';

dotenv.config();
const app = express();
const server = http.createServer(app);

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const activeCalls = new Map(); // store active call sessions

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

import callRoutes from './routes/callRoutes.js';

app.use('/api/calls', callRoutes);

initializeWebSocket(server, deepgram, activeCalls);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`phone number: ${process.env.PHONE_NUMBER}`);
  console.log('speech recognition is enabled');
  console.log("make sure to update your Twilio webhook URL");
});
