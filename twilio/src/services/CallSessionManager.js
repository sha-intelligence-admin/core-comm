import { CONFIG } from '../config/config.js';

class CallSessionManager {
  constructor() {
    this.activeCalls = new Map();
    this.cleanupInterval = null;
    this.metrics = {
      totalCalls: 0,
      activeCalls: 0,
      completedCalls: 0,
      failedCalls: 0
    };
    
    this.startCleanupInterval();
  }

  createCallSession(callSid, streamSid, ws, callerNumber = null, receivingNumber = null) {
    const session = {
      callSid,
      streamSid,
      ws,
      callerNumber,
      receivingNumber,
      startTime: new Date(),
      lastActivity: new Date(),
      transcripts: [],
      context: {
        topic: null,
        customerInfo: null,
        nextStep: null,
      },
      deepgramConnection: null,
      status: 'active'
    };

    this.activeCalls.set(callSid, session);
    this.metrics.totalCalls++;
    this.metrics.activeCalls++;
    
    console.log(`Call session created for ${callSid}. Active calls: ${this.metrics.activeCalls}`);
    return session;
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
    const session = this.activeCalls.get(callSid);
    if (session) {
      // Clean up Deepgram connection
      if (session.deepgramConnection) {
        try {
          session.deepgramConnection.finish();
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

      this.activeCalls.delete(callSid);
      this.metrics.activeCalls--;
      
      if (reason === 'completed') {
        this.metrics.completedCalls++;
      } else if (reason === 'failed') {
        this.metrics.failedCalls++;
      }

      console.log(`Call session removed for ${callSid} (${reason}). Active calls: ${this.metrics.activeCalls}`);
      return session;
    }
    return null;
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
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      const totalSessionTime = now.getTime() - session.startTime.getTime();

      // Remove sessions that are too old or have been inactive
      if (totalSessionTime > CONFIG.CALL_SESSION_MAX_AGE || 
          timeSinceLastActivity > CONFIG.CALL_SESSION_CLEANUP_INTERVAL) {
        staleCallIds.push(callSid);
      }
    }

    staleCallIds.forEach(callSid => {
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
      callSessions: Array.from(this.activeCalls.entries()).map(([callSid, session]) => ({
        callSid,
        duration: new Date().getTime() - session.startTime.getTime(),
        transcriptCount: session.transcripts.length,
        status: session.status
      }))
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