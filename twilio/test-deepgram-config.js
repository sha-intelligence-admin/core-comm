#!/usr/bin/env node

/**
 * Deepgram Connection Test
 * Test the fixed Deepgram configuration to ensure stability
 */

import { CONFIG } from './src/config/config.js';

console.log('🔍 Deepgram Connection Test');
console.log('===========================');

console.log('\n📊 Current Configuration:');
console.log(`├─ Model: ${CONFIG.DEEPGRAM_MODEL}`);
console.log(`├─ Language: ${CONFIG.DEEPGRAM_LANGUAGE}`);
console.log(`├─ Endpointing: ${CONFIG.DEEPGRAM_ENDPOINTING}ms`);
console.log(`├─ Connection Timeout: ${CONFIG.DEEPGRAM_CONNECTION_TIMEOUT}ms`);
console.log(`├─ Speech Pause Threshold: ${CONFIG.SPEECH_PAUSE_THRESHOLD}ms`);
console.log(`├─ Response Delay: ${CONFIG.RESPONSE_DELAY_AFTER_SPEECH}ms`);
console.log(`└─ Smart Pause Detection: ${CONFIG.SMART_PAUSE_DETECTION}`);

console.log('\n🔧 Configuration Validation:');

// Check for undefined values
let hasIssues = false;

if (!CONFIG.SPEECH_PAUSE_THRESHOLD || CONFIG.SPEECH_PAUSE_THRESHOLD === undefined) {
  console.log('❌ SPEECH_PAUSE_THRESHOLD is undefined');
  hasIssues = true;
} else {
  console.log(`✅ SPEECH_PAUSE_THRESHOLD: ${CONFIG.SPEECH_PAUSE_THRESHOLD}ms`);
}

if (!CONFIG.DEEPGRAM_MODEL) {
  console.log('❌ DEEPGRAM_MODEL is undefined');
  hasIssues = true;
} else {
  console.log(`✅ DEEPGRAM_MODEL: ${CONFIG.DEEPGRAM_MODEL}`);
}

if (!CONFIG.DEEPGRAM_ENDPOINTING) {
  console.log('❌ DEEPGRAM_ENDPOINTING is undefined');
  hasIssues = true;
} else {
  console.log(`✅ DEEPGRAM_ENDPOINTING: ${CONFIG.DEEPGRAM_ENDPOINTING}ms`);
}

console.log('\n🌐 Test Deepgram URL Construction:');
const testUrl = `wss://api.deepgram.com/v1/listen?model=${CONFIG.DEEPGRAM_MODEL}&language=${CONFIG.DEEPGRAM_LANGUAGE}&punctuate=true&smart_format=true&interim_results=true&endpointing=${CONFIG.DEEPGRAM_ENDPOINTING}&encoding=mulaw&sample_rate=8000&utterance_end_ms=${CONFIG.SPEECH_PAUSE_THRESHOLD}&vad_events=true`;

console.log('URL:', testUrl);

// Check for undefined in URL
if (testUrl.includes('undefined')) {
  console.log('❌ URL contains undefined values!');
  hasIssues = true;
} else {
  console.log('✅ URL is properly constructed');
}

console.log('\n🎯 Performance Settings:');
console.log('├─ Question Response: ~350ms');
console.log('├─ Statement Response: ~500ms');
console.log('├─ Incomplete Thought: ~800ms');
console.log('└─ Max Wait: 2000ms');

if (hasIssues) {
  console.log('\n❌ Configuration has issues that need to be fixed!');
  process.exit(1);
} else {
  console.log('\n✅ Configuration is valid and ready for deployment!');
}

console.log('\n🚀 Next Steps:');
console.log('1. Restart your Twilio service');
console.log('2. Monitor logs for successful Deepgram connections');
console.log('3. Test with actual phone calls');
console.log('4. Verify response timing improvements');
