# Multilingual Vapi Assistant Implementation Roadmap

This document outlines the steps to enable users to select a language when creating a Vapi assistant.

## Supported Languages

*   English (`en`)
*   Arabic (`ar`)
*   French (`fr`)
*   Spanish (`es`)
*   Portuguese (`pt`)
*   German (`de`)
*   Hindi (`hi`)
*   Mandarin Chinese (`zh`)
*   Japanese (`ja`)
*   Swahili (`sw`)

## 1. Update Type Definitions

**File:** `lib/vapi/types.ts`

**Goal:** Add language support to the assistant configuration types.

*   **Action:** Update `CreateAssistantParams` and `VapiAssistant` interfaces.
*   **Details:**
    *   Add a `language` field.
    *   Define a `SupportedLanguage` type.

```typescript
export type SupportedLanguage = 'en' | 'ar' | 'fr' | 'es' | 'pt' | 'de' | 'hi' | 'zh' | 'ja' | 'sw';

export interface CreateAssistantParams {
  // ... existing fields
  language?: SupportedLanguage;
}
```

## 2. Update Vapi Service Logic

**File:** `lib/vapi/assistants.ts`

**Goal:** Configure the Vapi assistant with the correct transcriber and model settings for the selected language.

*   **Action:** Modify the `createAssistant` function.
*   **Details:**
    *   Accept the `language` parameter.
    *   Map the language code to Vapi's `transcriber` configuration.
    *   (Optional) Select appropriate default voices for each language if not specified.

```typescript
// Example logic to be added
const transcriberConfig = {
  provider: "deepgram",
  model: "nova-2",
  language: params.language || 'en', 
};

// In vapi.assistants.create payload:
transcriber: transcriberConfig,
model: {
    // ... existing model config
    // Ensure the system prompt instructs the AI to speak in the selected language
    messages: [
        {
            role: 'system',
            content: `${params.systemPrompt}\n\nIMPORTANT: You must converse in ${getLanguageName(params.language)}.`,
        }
    ]
}
```

## 3. Update Backend API

**File:** `app/api/voice-agents/route.ts`

**Goal:** Expose the language selection to the frontend and pass it to the Vapi service.

*   **Action:** Update the POST handler and validation schema.
*   **Details:**
    *   Update `voiceAgentSchema` (Zod) to accept `language`.
    *   Ensure the `language` field is passed when calling `createAssistant`.
    *   Store the language setting in the `voice_agents` table (it likely already has a `language` column, verify this).

## 4. Update Frontend UI

**File:** `components/add-agent-modal.tsx`

**Goal:** Allow users to select the language in the creation modal.

*   **Action:** Add a language selector to the form.
*   **Details:**
    *   Add a `<Select>` component for Language.
    *   Populate it with the supported languages list.
    *   Update the `formData` state to include `language`.
    *   Pass the selected language in the API request payload.

## 5. Database Verification (Optional)

*   **Action:** Verify that the `voice_agents` table in Supabase has a `language` column and that it can store the language codes.
*   **File:** `supabase/schema.sql` (or check via Supabase dashboard).

## 6. Testing

*   **Action:** Create an assistant in each language and verify:
    1.  The Vapi dashboard shows the correct language/transcriber setting.
    2.  The assistant speaks and understands the selected language.
