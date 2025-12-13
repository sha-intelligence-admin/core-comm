/**
 * Vapi Type Definitions
 * TypeScript interfaces for Vapi entities and configurations
 */

// ==============================================
// Model Configuration
// ==============================================

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'groq';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  knowledgeBaseId?: string;
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

// ==============================================
// Voice Configuration
// ==============================================

export type VoiceProvider =
  | 'vapi'
  | '11labs'
  | 'elevenlabs'
  | 'azure'
  | 'cartesia'
  | 'custom-voice'
  | 'deepgram'
  | 'hume'
  | 'lmnt'
  | 'neuphonic'
  | 'openai'
  | 'playht'
  | 'rime-ai'
  | 'smallest-ai'
  | 'tavus'
  | 'sesame'
  | 'inworld'
  | 'minimax'
  | 'wellsaid'
  | 'orpheus';

export interface VoiceConfig {
  provider: VoiceProvider;
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

// ==============================================
// Assistant
// ==============================================

export interface CreateAssistantParams {
  name: string;
  description?: string;
  systemPrompt: string;
  firstMessage: string;
  model: ModelConfig;
  voice: VoiceConfig;
  knowledgeBaseId?: string;
}

export interface UpdateAssistantParams {
  name?: string;
  description?: string;
  systemPrompt?: string;
  firstMessage?: string;
  model?: Partial<ModelConfig>;
  voice?: Partial<VoiceConfig>;
  knowledgeBaseId?: string;
}

export interface VapiAssistant {
  id: string;
  name: string;
  model: ModelConfig;
  voice: VoiceConfig;
  firstMessage: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================================
// Knowledge Base
// ==============================================

export interface CreateKnowledgeBaseParams {
  name: string;
  description?: string;
  provider?: 'google' | 'openai';
}

export interface VapiKnowledgeBase {
  id: string;
  name: string;
  provider: string;
  createdAt: string;
}

// ==============================================
// Files
// ==============================================

export interface VapiFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface UploadFileResponse {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

// ==============================================
// Phone Numbers
// ==============================================

export type PhoneProvider = 'vapi' | 'twilio' | 'vonage' | 'telnyx' | 'byo';

export interface CreatePhoneNumberParams {
  provider?: PhoneProvider;
  assistantId?: string;
  name?: string;
  number?: string; // For BYO
  areaCode?: string; // For provisioning new number
  fallbackDestination?: {
    type: 'number';
    number: string;
  };
}

export interface VapiPhoneNumber {
  id: string;
  number: string;
  provider: PhoneProvider;
  assistantId?: string;
  createdAt: string;
}

// ==============================================
// Calls
// ==============================================

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';

export interface VapiCall {
  id: string;
  assistantId?: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  cost?: number;
  costBreakdown?: {
    transport?: number;
    stt?: number;
    llm?: number;
    tts?: number;
    vapi?: number;
    total?: number;
  };
  transcript?: string;
  summary?: string;
  recordingUrl?: string;
  analysis?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

export interface CreateCallParams {
  assistantId: string;
  customer: {
    number: string;
  };
  phoneNumberId?: string;
}

// ==============================================
// Webhook Events
// ==============================================

export type WebhookEventType =
  | 'assistant-request'
  | 'status-update'
  | 'end-of-call-report'
  | 'function-call'
  | 'hang'
  | 'speech-update'
  | 'transcript';

export interface WebhookPayload {
  message: {
    type: WebhookEventType;
    call?: any;
    [key: string]: any;
  };
}

export interface TranscriptPayload extends WebhookPayload {
  message: {
    type: 'transcript';
    transcriptType: 'partial' | 'final';
    transcript: string;
    role: 'user' | 'assistant';
    call: {
      id: string;
    };
  };
}

export interface AssistantRequestPayload extends WebhookPayload {
  message: {
    type: 'assistant-request';
    call: {
      id: string;
      phoneNumber?: {
        number: string;
      };
      customer?: {
        number: string;
      };
    };
  };
}

export interface EndOfCallReportPayload extends WebhookPayload {
  message: {
    type: 'end-of-call-report';
    call: VapiCall;
    transcript?: any;
    summary?: string;
    recordingUrl?: string;
    analysis?: {
      sentiment?: 'positive' | 'neutral' | 'negative';
    };
    costs?: any;
  };
}

export interface FunctionCallPayload extends WebhookPayload {
  message: {
    type: 'function-call';
    functionCall: {
      name: string;
      parameters: Record<string, any>;
    };
    call: {
      id: string;
    };
  };
}

// ==============================================
// Error Response
// ==============================================

export interface VapiError {
  message: string;
  code?: string;
  statusCode?: number;
}
