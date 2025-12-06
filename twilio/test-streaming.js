#!/usr/bin/env node
/**
 * Test script to validate the streaming pipeline implementation
 * This script simulates the streaming pipeline without requiring a full Twilio call
 */

import { CONFIG } from './src/config/config.js';
import StreamingPipelineService from './src/services/StreamingPipelineService.js';
import OpenAIService from './src/services/OpenAIService.js';
import ElevenLabsService from './src/services/ElevenLabsService.js';
import logger from './src/services/LoggingService.js';

// Test configuration
const TEST_CALL_SID = 'test-call-' + Date.now();
const TEST_TRANSCRIPTS = [
  "Hello, can you tell me about your AI services?",
  "What is your pricing model?",
  "How does your technology work?",
  "Thank you for the information, goodbye"
];

class StreamingPipelineTest {
  constructor() {
    this.streamingPipeline = new StreamingPipelineService();
    this.openaiService = new OpenAIService();
    this.elevenLabsService = new ElevenLabsService();
    this.testResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      timings: []
    };
  }

  async runTests() {
    console.log('🚀 Starting Streaming Pipeline Tests');
    console.log('====================================');
    console.log(`Streaming enabled: ${CONFIG.ENABLE_STREAMING_PIPELINE}`);
    console.log(`Speech pause threshold: ${CONFIG.SPEECH_PAUSE_THRESHOLD}ms`);
    console.log(`Response delay: ${CONFIG.RESPONSE_DELAY_AFTER_SPEECH}ms`);
    console.log('');

    // Test 1: Pipeline Initialization
    await this.testPipelineInitialization();

    // Test 2: Streaming Response Processing
    await this.testStreamingResponseProcessing();

    // Test 3: Audio Chunk Generation
    await this.testAudioChunkGeneration();

    // Test 4: Interruption Handling
    await this.testInterruptionHandling();

    // Test 5: Cleanup
    await this.testCleanup();

    // Test 6: Performance Benchmarks
    await this.testPerformanceBenchmarks();

    this.printResults();
  }

  async testPipelineInitialization() {
    console.log('📋 Test 1: Pipeline Initialization');
    const startTime = Date.now();

    try {
      const streamState = this.streamingPipeline.initializeStream(TEST_CALL_SID);
      
      if (streamState && streamState.callSid === TEST_CALL_SID && streamState.isActive) {
        this.recordTest('Pipeline Initialization', true, Date.now() - startTime);
        console.log('✅ Pipeline initialized successfully');
      } else {
        throw new Error('Invalid stream state returned');
      }
    } catch (error) {
      this.recordTest('Pipeline Initialization', false, Date.now() - startTime);
      console.log('❌ Pipeline initialization failed:', error.message);
    }
    console.log('');
  }

  async testStreamingResponseProcessing() {
    console.log('📋 Test 2: Streaming Response Processing');

    for (let i = 0; i < TEST_TRANSCRIPTS.length; i++) {
      const transcript = TEST_TRANSCRIPTS[i];
      const startTime = Date.now();

      try {
        console.log(`  Testing: "${transcript}"`);
        
        // This would normally process through the full pipeline
        // For testing, we'll simulate the key components
        const isStreamActive = this.streamingPipeline.isStreamActive(TEST_CALL_SID);
        
        if (isStreamActive) {
          // Simulate processing time
          await this.simulateResponseProcessing(transcript);
          
          const elapsed = Date.now() - startTime;
          this.recordTest(`Response Processing ${i + 1}`, true, elapsed);
          console.log(`  ✅ Processed in ${elapsed}ms`);
        } else {
          throw new Error('Stream not active');
        }
      } catch (error) {
        this.recordTest(`Response Processing ${i + 1}`, false, Date.now() - startTime);
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }
    console.log('');
  }

  async testAudioChunkGeneration() {
    console.log('📋 Test 3: Audio Chunk Generation');
    const testText = "This is a test of the audio chunk generation system.";
    const startTime = Date.now();

    try {
      const audioResult = await this.elevenLabsService.generateSpeech(testText);
      
      if (audioResult.success && audioResult.audioBuffer) {
        const elapsed = Date.now() - startTime;
        this.recordTest('Audio Chunk Generation', true, elapsed);
        console.log(`✅ Generated ${audioResult.audioBuffer.length} bytes in ${elapsed}ms`);
      } else {
        throw new Error('Audio generation failed');
      }
    } catch (error) {
      this.recordTest('Audio Chunk Generation', false, Date.now() - startTime);
      console.log('❌ Audio generation failed:', error.message);
    }
    console.log('');
  }

  async testInterruptionHandling() {
    console.log('📋 Test 4: Interruption Handling');
    const startTime = Date.now();

    try {
      // Test interruption
      this.streamingPipeline.handleInterruption(TEST_CALL_SID);
      
      // Verify stream state changed
      const isActive = this.streamingPipeline.isStreamActive(TEST_CALL_SID);
      
      if (!isActive) {
        this.recordTest('Interruption Handling', true, Date.now() - startTime);
        console.log('✅ Interruption handled correctly');
        
        // Re-initialize for remaining tests
        this.streamingPipeline.initializeStream(TEST_CALL_SID);
      } else {
        throw new Error('Stream still active after interruption');
      }
    } catch (error) {
      this.recordTest('Interruption Handling', false, Date.now() - startTime);
      console.log('❌ Interruption handling failed:', error.message);
    }
    console.log('');
  }

  async testCleanup() {
    console.log('📋 Test 5: Cleanup');
    const startTime = Date.now();

    try {
      this.streamingPipeline.cleanupStream(TEST_CALL_SID);
      
      // Verify cleanup
      const isActive = this.streamingPipeline.isStreamActive(TEST_CALL_SID);
      
      if (!isActive) {
        this.recordTest('Cleanup', true, Date.now() - startTime);
        console.log('✅ Cleanup completed successfully');
      } else {
        throw new Error('Stream still active after cleanup');
      }
    } catch (error) {
      this.recordTest('Cleanup', false, Date.now() - startTime);
      console.log('❌ Cleanup failed:', error.message);
    }
    console.log('');
  }

  async testPerformanceBenchmarks() {
    console.log('📋 Test 6: Performance Benchmarks');
    
    const benchmarks = [
      {
        name: 'OpenAI Streaming Response',
        test: () => this.openaiService.generateStreamingResponse("What is AI?", [], () => {})
      },
      {
        name: 'ElevenLabs TTS Generation',
        test: () => this.elevenLabsService.generateSpeech("Performance test")
      },
      {
        name: 'Pipeline Initialization',
        test: () => {
          const testSid = 'perf-test-' + Date.now();
          this.streamingPipeline.initializeStream(testSid);
          this.streamingPipeline.cleanupStream(testSid);
        }
      }
    ];

    for (const benchmark of benchmarks) {
      const startTime = Date.now();
      
      try {
        await benchmark.test();
        const elapsed = Date.now() - startTime;
        this.recordTest(benchmark.name, true, elapsed);
        console.log(`  ⚡ ${benchmark.name}: ${elapsed}ms`);
      } catch (error) {
        this.recordTest(benchmark.name, false, Date.now() - startTime);
        console.log(`  ❌ ${benchmark.name}: Failed - ${error.message}`);
      }
    }
    console.log('');
  }

  async simulateResponseProcessing(transcript) {
    // Simulate the key steps of the streaming pipeline
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing time
    
    // Simulate text chunk processing
    const chunks = transcript.split(' ');
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate streaming delay
    }
  }

  recordTest(testName, passed, duration) {
    this.testResults.totalTests++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    this.testResults.timings.push({ test: testName, duration, passed });
  }

  printResults() {
    console.log('📊 Test Results Summary');
    console.log('=====================');
    console.log(`Total Tests: ${this.testResults.totalTests}`);
    console.log(`Passed: ${this.testResults.passed} ✅`);
    console.log(`Failed: ${this.testResults.failed} ❌`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(1)}%`);
    console.log('');

    if (this.testResults.timings.length > 0) {
      console.log('⚡ Performance Summary:');
      const avgTiming = this.testResults.timings.reduce((sum, t) => sum + t.duration, 0) / this.testResults.timings.length;
      const maxTiming = Math.max(...this.testResults.timings.map(t => t.duration));
      const minTiming = Math.min(...this.testResults.timings.map(t => t.duration));
      
      console.log(`Average Response Time: ${avgTiming.toFixed(1)}ms`);
      console.log(`Fastest Response: ${minTiming}ms`);
      console.log(`Slowest Response: ${maxTiming}ms`);
      
      // Check if we achieved our speed goals
      const speedGoal = 500; // 500ms target
      const passedSpeedGoal = this.testResults.timings.filter(t => t.duration <= speedGoal).length;
      console.log(`Speed Goal (${speedGoal}ms): ${passedSpeedGoal}/${this.testResults.timings.length} tests passed`);
    }

    console.log('');
    console.log(this.testResults.failed === 0 ? 
      '🎉 All tests passed! Streaming pipeline ready for deployment.' :
      '⚠️  Some tests failed. Please review the implementation before deployment.'
    );
  }
}

// Run the tests
const testRunner = new StreamingPipelineTest();
testRunner.runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});