/**
 * Vapi SDK Client Wrapper
 * Provides a configured Vapi client instance for server-side operations
 */

import { VapiClient } from '@vapi-ai/server-sdk';

/**
 * Creates a new Vapi client instance with API key from environment
 * @throws Error if VAPI_API_KEY is not configured
 */
export function createVapiClient(): VapiClient {
  const apiKey = process.env.VAPI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'VAPI_API_KEY is not configured. Please add it to your .env.local file.'
    );
  }

  return new VapiClient({
    token: apiKey,
  });
}

/**
 * Singleton Vapi client instance
 * Use this for most operations to avoid creating multiple clients
 */
let vapiClientInstance: VapiClient | null = null;

export function getVapiClient(): VapiClient {
  if (!vapiClientInstance) {
    vapiClientInstance = createVapiClient();
  }
  return vapiClientInstance;
}

/**
 * Default configuration values from environment
 */
export const VAPI_DEFAULTS = {
  model: process.env.VAPI_DEFAULT_MODEL || 'gpt-4o',
  voiceProvider: process.env.VAPI_DEFAULT_VOICE_PROVIDER || 'elevenlabs',
  voiceId: process.env.VAPI_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
  phoneProvider: process.env.VAPI_PHONE_PROVIDER || 'vapi',
  phoneCountry: process.env.VAPI_PHONE_COUNTRY || 'US',
} as const;
