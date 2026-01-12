# Modal Improvement Plan

This document outlines the steps to make all application modals fully functional and responsive, replacing simulated behaviors with real backend integrations.

## Phase 1: Backend Infrastructure

To replace simulated "setTimeout" delays with real functionality, we need dedicated API endpoints for testing connections.

### 1. Create Integration Test Endpoint
**File:** `app/api/integrations/test/route.ts`
- **Goal:** Validate API keys and endpoints before saving.
- **Logic:** 
  - Accept `type`, `endpoint`, and `apiKey`.
  - Perform a lightweight HTTP request (e.g., `HEAD` or `GET /health`) to the target service to verify connectivity.
  - Return `200 OK` if successful, or specific error details if failed.

### 2. Create Channel Test Endpoint
**File:** `app/api/messaging-channels/test/route.ts`
- **Goal:** Verify messaging provider credentials (Twilio, Meta, etc.).
- **Logic:** 
  - Accept `provider` and `credentials`.
  - Attempt a "dry run" authentication check or validate credential format.
  - Return success/failure status.

### 3. Update Voice Agents API
**File:** `app/api/voice-agents/route.ts`
- **Goal:** Support non-voice agents (Messaging, Email).
- **Logic:** 
  - Update validation schema to make `voice_model` optional if the agent type is not "voice".
  - Allow creation of "Messaging" or "Email" agents by storing them with a `type` field.

## Phase 2: Frontend Implementation

### 1. Add Integration Modal
**File:** `components/add-integration-modal.tsx`
- **Action:** Replace `setTimeout` simulation with `fetch('/api/integrations/test')`.
- **UX:** Display specific error messages returned by the backend (e.g., "Invalid API Key", "Endpoint unreachable").

### 2. Add Channel Modal
**File:** `components/add-channel-modal.tsx`
- **Action:** Replace random success/fail logic with `fetch('/api/messaging-channels/test')`.
- **UX:** Show a success checkmark only when the backend confirms credentials are valid.

### 3. Add Agent Modal
**File:** `components/add-agent-modal.tsx`
- **Action:** Remove the restriction `if (formData.channel === "voice")`.
- **Logic:**
  - If "Messaging" or "Email" is selected, hide the "Voice Model" dropdown.
  - Submit form to backend with the appropriate `type`.
  - Handle non-voice agent creation gracefully.

### 4. Call Transcript Modal
**File:** `components/call-transcript-modal.tsx`
- **Action:** Enable the **Search** input.
- **Logic:** 
  - Implement client-side filtering.
  - On input change, filter displayed transcript lines.
  - Highlight matching text.

## Phase 3: Responsive Design Polish

Ensure all modals work seamlessly on mobile devices (phones/tablets).

### 1. Viewport Constraints
- Verify all `DialogContent` components use `max-h-[85vh]` (or similar) to prevent the modal from being taller than the screen.
- Ensure `overflow-y-auto` is applied to the content area for scrolling.

### 2. Touch Targets
- Ensure all inputs and buttons have a minimum height of `44px`.
- Verify font sizes are at least `16px` on inputs to prevent iOS auto-zoom.

### 3. Layout Adjustments
- Stack multi-column layouts (e.g., "Knowledge Source" and "Handoff" fields) into a single column on mobile (`sm:grid-cols-1`).
