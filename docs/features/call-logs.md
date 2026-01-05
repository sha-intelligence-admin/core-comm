# Call Logs & Transcripts Feature

## Overview
This feature provides visibility into all voice interactions handled by the AI agents. It includes a searchable table of call logs and a detailed view for individual call transcripts and recordings.

## User Stories
- As a user, I can view a list of all past calls.
- As a user, I can filter calls by date, status, or agent.
- As a user, I can read the transcript of a conversation.
- As a user, I can listen to the audio recording of a call.
- As a user, I can see a live transcript of an ongoing call.

## Technical Implementation

### Components
- `components/call-logs-table.tsx`: Main list view.
- `components/call-transcript-modal.tsx`: Detail view.
- `components/live-transcript.tsx`: Real-time view using Supabase subscriptions.

### Database Tables
- `call_logs`: Header information (caller, duration, status).
- `transcript_segments`: Individual lines of dialogue.

### Data Flow
1. **Ingestion**: Vapi webhook sends `call-completed` event.
2. **Processing**: API parses transcript and recording URL.
3. **Storage**: Data saved to `call_logs` and `transcript_segments`.
4. **Display**: Frontend fetches data via Supabase client.

## Real-time Updates
- The dashboard subscribes to `INSERT` events on `call_logs` to show new calls instantly without refreshing.

## References
- [REALTIME_TRANSCRIPT_PLAN.md](../../REALTIME_TRANSCRIPT_PLAN.md)
