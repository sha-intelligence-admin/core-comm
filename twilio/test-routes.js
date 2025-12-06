// Minimal server test to check routing without API dependencies
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Test routes
app.get('/api/audio/greeting', (req, res) => {
  console.log('✅ /api/audio/greeting endpoint hit!');
  res.json({ message: 'Greeting endpoint working', timestamp: new Date().toISOString() });
});

app.get('/api/audio/dynamic', (req, res) => {
  console.log('✅ /api/audio/dynamic endpoint hit!');
  const encodedText = req.query.text;
  if (!encodedText) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }
  
  try {
    const text = Buffer.from(encodedText, 'base64').toString('utf-8');
    console.log(`   Text decoded: ${text.substring(0, 50)}...`);
    res.json({ 
      message: 'Dynamic endpoint working', 
      decodedText: text,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid base64 text' });
  }
});

app.post('/api/calls/voice', (req, res) => {
  console.log('✅ /api/calls/voice endpoint hit!');
  res.type('text/xml');
  res.send(`
    <Response>
      <Say voice="alice">Test endpoint is working</Say>
    </Response>
  `);
});

app.get('/api/health', (req, res) => {
  console.log('✅ /api/health endpoint hit!');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all for debugging
app.use('*', (req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: '404 Not Found', 
    method: req.method,
    path: req.originalUrl,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/audio/greeting', 
      'GET /api/audio/dynamic?text=<base64>',
      'POST /api/calls/voice'
    ]
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📍 Available endpoints:');
  console.log('   • GET  /api/health');
  console.log('   • GET  /api/audio/greeting');
  console.log('   • GET  /api/audio/dynamic?text=<base64>');
  console.log('   • POST /api/calls/voice');
  console.log('\n🧪 Test commands:');
  console.log(`   curl http://localhost:${PORT}/api/health`);
  console.log(`   curl http://localhost:${PORT}/api/audio/greeting`);
  console.log(`   curl "http://localhost:${PORT}/api/audio/dynamic?text=SGVsbG8gd29ybGQ="`);
});