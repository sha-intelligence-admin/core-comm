// Test script to verify ElevenLabs integration setup
import 'dotenv/config';
import ElevenLabsService from './src/services/ElevenLabsService.js';

console.log('🔧 Testing ElevenLabs Integration Setup...\n');

// Test environment variables
console.log('1. Environment Variables:');
const requiredVars = [
  'USE_ELEVENLABS_TTS',
  'ELEVENLABS_API_KEY',
  'NGROK_URL'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = varName === 'ELEVENLABS_API_KEY' ? 
    (value ? `${value.substring(0, 8)}...` : 'NOT SET') : 
    (value || 'NOT SET');
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('\n2. Testing ElevenLabs Service:');
const elevenLabsService = new ElevenLabsService();

try {
  console.log('   🔄 Testing speech generation...');
  const testText = "Hello, this is a test of ElevenLabs voice synthesis.";
  const result = await elevenLabsService.generateSpeech(testText);
  
  if (result.success) {
    console.log(`   ✅ ElevenLabs TTS working! Audio size: ${result.audioBuffer.length} bytes`);
    console.log(`   ✅ Voice ID: ${result.voiceId}`);
  } else {
    console.log(`   ❌ ElevenLabs TTS failed: ${result.error}`);
  }
} catch (error) {
  console.log(`   ❌ ElevenLabs error: ${error.message}`);
}

console.log('\n3. Route Configuration Test:');
console.log('   📍 Expected URLs:');
const ngrokUrl = process.env.NGROK_URL || 'your-ngrok-url';
console.log(`   • Greeting: https://${ngrokUrl}/api/audio/greeting`);
console.log(`   • Dynamic: https://${ngrokUrl}/api/audio/dynamic?text=<base64-text>`);
console.log(`   • Voice webhook: https://${ngrokUrl}/api/calls/voice`);

console.log('\n4. Call Flow Summary:');
console.log('   📞 Incoming call → /api/calls/voice');
console.log('   🎵 Initial greeting → /api/audio/greeting (ElevenLabs)');
console.log('   🗣️  User speaks → Deepgram transcription');
console.log('   🤖 AI response → OpenAI + Knowledge base');
console.log('   🎤 Voice response → /api/audio/dynamic (ElevenLabs)');
console.log('   🔄 Loop continues...');

console.log('\n✅ Setup test complete!');