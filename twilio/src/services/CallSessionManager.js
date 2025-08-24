import { CONFIG } from '../config/config.js';
import logger from './LoggingService.js';

class CallSessionManager {
  constructor() {
    this.activeCalls = new Map();
    this.cleanupInterval = null;
    this.metrics = {
      totalCalls: 0,
      activeCalls: 0,
      completedCalls: 0,
      failedCalls: 0,
    };

    this.startCleanupInterval();
  }

  // services/CallSessionManager.js

  // ...

  createCallSession(
    callSid,
    streamSid,
    ws,
    callerNumber,
    receivingNumber,
    streamUrl
  ) {
    const existingSession = this.activeCalls.get(callSid);

    if (existingSession) {
      console.log(`Updating existing call session for ${callSid}`);

      // 1. Close the old WebSocket connection to prevent it from hanging around
      try {
        existingSession.ws.close(1000, 'Replaced by new connection');
      } catch (error) {
        console.warn(
          `Could not close old WebSocket for ${callSid}: ${error.message}`
        );
      }

      // 2. Terminate the old Deepgram connection
      if (existingSession.deepgramConnection) {
        try {
          existingSession.deepgramConnection.finish();
          console.log(
            `Deepgram connection closed for old stream on ${callSid}`
          );
        } catch (error) {
          console.warn(
            `Could not close old Deepgram connection for ${callSid}: ${error.message}`
          );
        }
      }

      // 3. Update the session with the new connection details
      existingSession.streamSid = streamSid;
      existingSession.ws = ws;
      existingSession.lastActivity = new Date();
      existingSession.deepgramConnection = null; // Prepare for the new connection
      existingSession.isTranscriptionReady = false;
      existingSession.startupComplete = false;
      existingSession.isReadyForEvents = false;
      existingSession.isEnding = false; // Reset ending flag for new connection
      existingSession.endingInitiatedAt = null;
      // Keep existing conversationHistory - don't reset it

      return existingSession;
    }

    // If no session exists, create a new one
    const newSession = {
      isReadyForEvents: false,
      callSid,
      streamSid,
      ws,
      callerNumber,
      receivingNumber,
      streamUrl,
      startTime: new Date(),
      transcripts: [],
      conversationHistory: [], // NEW: For OpenAI conversation tracking
      deepgramConnection: null,
      lastActivity: new Date(),
      isTranscriptionReady: false,
      hasUserSpoken: false,
      startupComplete: false,
      lastProcessedTranscript: null,
      lastResponseTime: null,
      lastTranscriptTime: null,
      speechBuffer: [],
      isEnding: false, // NEW: Flag to indicate call is ending
      endingInitiatedAt: null,
      // Enhanced speech detection for natural conversation flow
      speechStartTime: null,
      speechEndTime: null,
      isSpeaking: false,
      speechPauseTimer: null,
      pendingResponse: null,
    };

    this.activeCalls.set(callSid, newSession);
    this.metrics.totalCalls++;
    this.metrics.activeCalls = this.activeCalls.size;
    console.log(
      `Call session created for ${callSid}. Active calls: ${this.activeCalls.size}`
    );

    return newSession;
  }

  getCallSession(callSid) {
    return this.activeCalls.get(callSid);
  }

  updateLastActivity(callSid) {
    const session = this.activeCalls.get(callSid);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  addTranscript(callSid, transcript) {
    const session = this.activeCalls.get(callSid);
    if (session) {
      session.transcripts.push({
        text: transcript.text,
        confidence: transcript.confidence,
        time: new Date(),
      });
      this.updateLastActivity(callSid);
    }
  }

  setDeepgramConnection(callSid, connection) {
    const session = this.activeCalls.get(callSid);
    if (session) {
      session.deepgramConnection = connection;
    }
  }

  removeCallSession(callSid, reason = 'completed') {
    if (!callSid) {
      console.warn('Attempted to remove call session with null callSid');
      return null;
    }

    const session = this.activeCalls.get(callSid);
    if (!session) {
      console.warn(`Attempted to remove non-existent call session: ${callSid}`);
      return null;
    }

    // Clean up timers
    if (session.speechPauseTimer) {
      clearTimeout(session.speechPauseTimer);
      session.speechPauseTimer = null;
    }
    if (session.pendingResponse) {
      clearTimeout(session.pendingResponse);
      session.pendingResponse = null;
    }

    // Clean up Deepgram connection
    if (session.deepgramConnection) {
      try {
        if (typeof session.deepgramConnection.finish === 'function') {
          session.deepgramConnection.finish();
        }
      } catch (error) {
        console.error('Error finishing Deepgram connection:', error);
      }
    }

    // Close WebSocket if still open
    if (session.ws && session.ws.readyState === 1) {
      try {
        session.ws.terminate();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    }

    // Remove from active calls
    this.activeCalls.delete(callSid);

    // Update metrics correctly (don't decrement, just count current size)
    this.metrics.activeCalls = this.activeCalls.size;

    if (reason === 'completed') {
      this.metrics.completedCalls++;
    } else if (reason === 'failed') {
      this.metrics.failedCalls++;
    }

    // Use the actual size, not decrement
    console.log(
      `Call session removed for ${callSid} (${reason}). Active calls: ${this.activeCalls.size}`
    );
    return session;
  }

  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, CONFIG.CALL_SESSION_CLEANUP_INTERVAL);
  }

  cleanupStaleConnections() {
    const now = new Date();
    const staleCallIds = [];

    for (const [callSid, session] of this.activeCalls.entries()) {
      const timeSinceLastActivity =
        now.getTime() - session.lastActivity.getTime();
      const totalSessionTime = now.getTime() - session.startTime.getTime();

      // Remove sessions that are too old or have been inactive
      if (
        totalSessionTime > CONFIG.CALL_SESSION_MAX_AGE ||
        timeSinceLastActivity > CONFIG.CALL_SESSION_CLEANUP_INTERVAL
      ) {
        staleCallIds.push(callSid);
      }
    }

    staleCallIds.forEach((callSid) => {
      console.warn(`Cleaning up stale call session: ${callSid}`);
      this.removeCallSession(callSid, 'timeout');
    });

    if (staleCallIds.length > 0) {
      console.log(`Cleaned up ${staleCallIds.length} stale call sessions`);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeCalls: this.activeCalls.size,
      callSessions: Array.from(this.activeCalls.entries()).map(
        ([callSid, session]) => ({
          callSid,
          duration: new Date().getTime() - session.startTime.getTime(),
          transcriptCount: session.transcripts.length,
          status: session.status,
        })
      ),
    };
  }

  getAllActiveCalls() {
    return this.activeCalls;
  }

  getCallCount() {
    return this.activeCalls.size;
  }

  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up all active sessions
    for (const callSid of this.activeCalls.keys()) {
      this.removeCallSession(callSid, 'shutdown');
    }
  }
}

// Singleton instance
const callSessionManager = new CallSessionManager();
export default callSessionManager;
