#!/usr/bin/env node
import dotenv from 'dotenv';
import { CONFIG } from './src/config/config.js';

dotenv.config();

console.log('🔍 Environment Variable Check\n');

const requiredVars = CONFIG.REQUIRED_ENV_VARS;
const missing = [];
const placeholder = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    missing.push(varName);
  } else if (value.startsWith('your_')) {
    placeholder.push(varName);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  }
});

if (missing.length > 0) {
  console.log('\n❌ Missing Variables:');
  missing.forEach(varName => console.log(`   • ${varName}`));
}

if (placeholder.length > 0) {
  console.log('\n⚠️  Placeholder Values (need real keys):');
  placeholder.forEach(varName => console.log(`   • ${varName}: ${process.env[varName]}`));
}

console.log(`\n📡 NGROK_URL: ${process.env.NGROK_URL || 'NOT SET'}`);
console.log(`🎵 USE_ELEVENLABS_TTS: ${process.env.USE_ELEVENLABS_TTS || 'NOT SET'}`);

if (missing.length === 0 && placeholder.length === 0) {
  console.log('\n🎉 All environment variables are properly configured!');
  console.log('Try running: npm start');
} else {
  console.log('\n🚨 Server will NOT start until all API keys are configured.');
  console.log('Please add your actual API keys to the .env file.');
}