import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

import callRoutes from './routes/callRoutes.js';

app.use('/api/calls', callRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});