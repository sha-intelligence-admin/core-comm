import { 
  validators, 
  validateWebhookData, 
  sanitizeTranscript, 
  validatePhoneNumbers,
  ValidationError 
} from '../../src/utils/validation.js';

describe('ValidationService', () => {
  describe('validators', () => {
    test('phoneNumber validator', () => {
      expect(validators.phoneNumber('+1234567890')).toBe(true);
      expect(validators.phoneNumber('1234567890')).toBe(true);
      expect(validators.phoneNumber('+44 20 7946 0958')).toBe(true);
      expect(validators.phoneNumber('invalid')).toBe(false);
      expect(validators.phoneNumber('')).toBe(false);
    });

    test('callSid validator', () => {
      expect(validators.callSid('CA1234567890abcdef1234567890abcdef')).toBe(true);
      expect(validators.callSid('CA123')).toBe(false);
      expect(validators.callSid('invalid')).toBe(false);
    });

    test('confidence validator', () => {
      expect(validators.confidence(0.5)).toBe(true);
      expect(validators.confidence(0)).toBe(true);
      expect(validators.confidence(1)).toBe(true);
      expect(validators.confidence(1.5)).toBe(false);
      expect(validators.confidence(-0.1)).toBe(false);
    });
  });

  describe('validateWebhookData', () => {
    test('valid webhook data', () => {
      const validData = {
        event: 'start',
        start: {
          callSid: 'CA1234567890abcdef1234567890abcdef',
          streamSid: 'MZ1234567890abcdef1234567890abcdef'
        }
      };
      expect(() => validateWebhookData(validData)).not.toThrow();
    });

    test('invalid webhook data', () => {
      const invalidData = {
        event: 'invalid_event'
      };
      expect(() => validateWebhookData(invalidData)).toThrow(ValidationError);
    });
  });

  describe('sanitizeTranscript', () => {
    test('removes HTML tags', () => {
      const input = '<script>alert("test")</script>Hello world';
      const result = sanitizeTranscript(input);
      expect(result).toBe('Hello world');
    });

    test('removes special characters', () => {
      const input = 'Hello @#$% world!';
      const result = sanitizeTranscript(input);
      expect(result).toBe('Hello  world!');
    });

    test('handles non-string input', () => {
      expect(sanitizeTranscript(null)).toBe('');
      expect(sanitizeTranscript(123)).toBe('');
    });

    test('limits length', () => {
      const longInput = 'a'.repeat(2000);
      const result = sanitizeTranscript(longInput);
      expect(result.length).toBe(1000);
    });
  });

  describe('validatePhoneNumbers', () => {
    test('valid phone numbers', () => {
      expect(() => validatePhoneNumbers('+1234567890', '+0987654321')).not.toThrow();
    });

    test('invalid phone numbers', () => {
      expect(() => validatePhoneNumbers('invalid', '+0987654321')).toThrow(ValidationError);
    });
  });
});