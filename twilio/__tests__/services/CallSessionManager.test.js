import CallSessionManager from '../../src/services/CallSessionManager.js';

describe('CallSessionManager', () => {
  let mockWs;

  beforeEach(() => {
    mockWs = {
      readyState: 1,
      terminate: jest.fn()
    };
    
    // Clear all active calls
    const activeCalls = CallSessionManager.getAllActiveCalls();
    for (const callSid of activeCalls.keys()) {
      CallSessionManager.removeCallSession(callSid);
    }
  });

  test('creates call session', () => {
    const callSid = 'CA123';
    const streamSid = 'MZ123';
    const callerNumber = '+1234567890';
    const receivingNumber = '+0987654321';

    const session = CallSessionManager.createCallSession(
      callSid, streamSid, mockWs, callerNumber, receivingNumber
    );

    expect(session.callSid).toBe(callSid);
    expect(session.streamSid).toBe(streamSid);
    expect(session.callerNumber).toBe(callerNumber);
    expect(session.receivingNumber).toBe(receivingNumber);
    expect(session.status).toBe('active');
    expect(session.transcripts).toEqual([]);
  });

  test('retrieves call session', () => {
    const callSid = 'CA123';
    CallSessionManager.createCallSession(callSid, 'MZ123', mockWs);
    
    const session = CallSessionManager.getCallSession(callSid);
    expect(session).toBeDefined();
    expect(session.callSid).toBe(callSid);
  });

  test('adds transcript to session', () => {
    const callSid = 'CA123';
    CallSessionManager.createCallSession(callSid, 'MZ123', mockWs);
    
    const transcript = {
      text: 'Hello world',
      confidence: 0.9
    };
    
    CallSessionManager.addTranscript(callSid, transcript);
    
    const session = CallSessionManager.getCallSession(callSid);
    expect(session.transcripts).toHaveLength(1);
    expect(session.transcripts[0].text).toBe('Hello world');
    expect(session.transcripts[0].confidence).toBe(0.9);
  });

  test('removes call session', () => {
    const callSid = 'CA123';
    CallSessionManager.createCallSession(callSid, 'MZ123', mockWs);
    
    const removedSession = CallSessionManager.removeCallSession(callSid);
    expect(removedSession).toBeDefined();
    
    const session = CallSessionManager.getCallSession(callSid);
    expect(session).toBeUndefined();
  });

  test('gets metrics', () => {
    const metrics = CallSessionManager.getMetrics();
    expect(metrics).toHaveProperty('totalCalls');
    expect(metrics).toHaveProperty('activeCalls');
    expect(metrics).toHaveProperty('completedCalls');
    expect(metrics).toHaveProperty('failedCalls');
  });

  test('updates last activity', () => {
    const callSid = 'CA123';
    CallSessionManager.createCallSession(callSid, 'MZ123', mockWs);
    
    const session = CallSessionManager.getCallSession(callSid);
    const originalActivity = session.lastActivity;
    
    // Wait a bit to ensure timestamp difference
    setTimeout(() => {
      CallSessionManager.updateLastActivity(callSid);
      const updatedSession = CallSessionManager.getCallSession(callSid);
      expect(updatedSession.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
    }, 10);
  });
});