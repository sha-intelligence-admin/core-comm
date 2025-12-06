import TwilioService from '../../src/services/TwilioService.js';

// Mock twilio module
jest.mock('twilio', () => {
  const mockClient = {
    calls: jest.fn(() => ({
      update: jest.fn().mockResolvedValue({ sid: 'CA123' })
    }))
  };
  
  const mockTwiml = {
    VoiceResponse: jest.fn(() => ({
      say: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      toString: jest.fn().mockReturnValue('<Response><Say>Test</Say></Response>')
    }))
  };
  
  const twilio = jest.fn(() => mockClient);
  twilio.validateRequest = jest.fn();
  twilio.twiml = mockTwiml;
  
  return twilio;
});

describe('TwilioService', () => {
  let twilioService;

  beforeEach(() => {
    twilioService = new TwilioService();
  });

  test('creates voice response', () => {
    const response = twilioService.createVoiceResponse();
    expect(response).toBeDefined();
  });

  test('generates say response', () => {
    const text = 'Hello world';
    const response = twilioService.generateSayResponse(text);
    expect(response).toBeDefined();
  });

  test('generates say and redirect response', () => {
    const text = 'Hello world';
    const redirectUrl = '/api/calls/re-enter-stream';
    const response = twilioService.generateSayAndRedirectResponse(text, redirectUrl);
    expect(response).toBeDefined();
  });

  test('updates call', async () => {
    const callSid = 'CA123';
    const twimlResponse = twilioService.generateSayResponse('Test');
    
    const result = await twilioService.updateCall(callSid, twimlResponse);
    expect(result).toBe(true);
  });

  test('speaks to customer', async () => {
    const callSid = 'CA123';
    const text = 'Hello world';
    
    const result = await twilioService.speakToCustomer(callSid, text);
    expect(result).toBe(true);
  });

  test('validates webhook signature', () => {
    const signature = 'test-signature';
    const body = 'test-body';
    const url = 'http://example.com/webhook';
    
    // Mock the validation to return true
    const twilio = require('twilio');
    twilio.validateRequest.mockReturnValue(true);
    
    const isValid = TwilioService.validateWebhookSignature(signature, body, url);
    expect(twilio.validateRequest).toHaveBeenCalledWith(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      body
    );
  });
});