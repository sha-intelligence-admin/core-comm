// Simple HTML tag removal without external dependency

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export const validators = {
  phoneNumber: (value) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  callSid: (value) => {
    const callSidRegex = /^CA[0-9a-f]{32}$/i;
    return callSidRegex.test(value);
  },

  streamSid: (value) => {
    const streamSidRegex = /^MZ[0-9a-f]{32}$/i;
    return streamSidRegex.test(value);
  },

  webhookEvent: (value) => {
    const allowedEvents = ['connected', 'start', 'media', 'stop'];
    return allowedEvents.includes(value);
  },

  transcriptText: (value) => {
    return typeof value === 'string' && value.length <= 1000;
  },

  confidence: (value) => {
    return typeof value === 'number' && value >= 0 && value <= 1;
  }
};

export function validateWebhookData(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid webhook data format');
  }

  if (data.event && !validators.webhookEvent(data.event)) {
    errors.push({ field: 'event', message: 'Invalid webhook event type' });
  }

  if (data.start) {
    if (data.start.callSid && !validators.callSid(data.start.callSid)) {
      errors.push({ field: 'callSid', message: 'Invalid call SID format' });
    }
    if (data.start.streamSid && !validators.streamSid(data.start.streamSid)) {
      errors.push({ field: 'streamSid', message: 'Invalid stream SID format' });
    }
  }

  if (data.media && data.media.payload) {
    try {
      Buffer.from(data.media.payload, 'base64');
    } catch (error) {
      errors.push({ field: 'media.payload', message: 'Invalid base64 encoded media payload' });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return true;
}

export function sanitizeTranscript(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Remove HTML tags and potentially harmful content
  const sanitized = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/&lt;script[^&]*&gt;.*?&lt;\/script&gt;/gi, '') // Remove script tags
    .replace(/&lt;[^&]*&gt;/g, ''); // Remove HTML entities
  
  // Additional sanitization for NLP processing
  return sanitized
    .trim()
    .replace(/[^\w\s\-\.\,\?\!]/g, '') // Keep only alphanumeric, whitespace, and basic punctuation
    .substring(0, 1000); // Limit length
}

export function validatePhoneNumbers(callerNumber, receivingNumber) {
  const errors = [];

  if (callerNumber && !validators.phoneNumber(callerNumber)) {
    errors.push({ field: 'callerNumber', message: 'Invalid caller phone number format' });
  }

  if (receivingNumber && !validators.phoneNumber(receivingNumber)) {
    errors.push({ field: 'receivingNumber', message: 'Invalid receiving phone number format' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Phone number validation failed', errors);
  }

  return true;
}