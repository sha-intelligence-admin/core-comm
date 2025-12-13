# Real-time Call Transcript Implementation Plan

This plan outlines the steps to capture real-time call transcripts from Vapi and display them in the dashboard.

## 1. Database Schema

We need a new table to store transcript segments as they arrive. This avoids high-frequency updates to the main `calls` table and provides an append-only log for real-time syncing.

```sql
-- Create table for real-time transcript segments
create table call_transcript_segments (
  id uuid default gen_random_uuid() primary key,
  call_id uuid references calls(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  is_final boolean default false, -- true if this is a completed sentence/turn
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table call_transcript_segments enable row level security;

-- Allow read access for authenticated users (or restrict to company members)
create policy "Users can view transcripts for their company's calls"
  on call_transcript_segments for select
  using (
    exists (
      select 1 from calls
      where calls.id = call_transcript_segments.call_id
      and calls.company_id in (
        select company_id from organization_memberships
        where user_id = auth.uid()
      )
    )
  );

-- Allow service role to insert (for webhooks)
create policy "Service role can insert transcripts"
  on call_transcript_segments for insert
  with check (true);
```

## 2. Backend Implementation

### A. Update Vapi Types (`lib/vapi/types.ts`)

Add the `TranscriptPayload` interface to handle the specific structure of transcript events.

```typescript
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
```

### B. Update Webhook Handler (`app/api/webhooks/vapi/route.ts`)

Add a handler for the `transcript` event.

```typescript
// In POST function switch statement:
case 'transcript':
  return handleTranscript(message);

// New handler function:
async function handleTranscript(message: any) {
  // Only store 'final' transcripts to reduce DB noise, 
  // or store 'partial' if ultra-low latency is needed (but requires cleanup).
  // For this plan, we'll stick to 'final' segments (sentence-level).
  if (message.transcriptType !== 'final') {
    return createSuccessResponse({ received: true });
  }

  const supabase = createServiceRoleClient();
  
  // 1. Find our internal call_id using vapi_call_id
  const { data: call } = await supabase
    .from('calls')
    .select('id')
    .eq('vapi_call_id', message.call.id)
    .single();

  if (!call) {
    // Call record might not exist yet if webhook is faster than status-update
    // Optional: Create it or queue it. For now, log and skip.
    console.warn('Call not found for transcript:', message.call.id);
    return createSuccessResponse({ received: true });
  }

  // 2. Insert segment
  await supabase.from('call_transcript_segments').insert({
    call_id: call.id,
    role: message.role,
    content: message.transcript,
    is_final: true
  });

  return createSuccessResponse({ received: true });
}
```

## 3. Frontend Implementation

### A. Create `LiveTranscript` Component

Create `components/live-transcript.tsx` to display the conversation.

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TranscriptSegment {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function LiveTranscript({ callId }: { callId: string }) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch existing segments
    const fetchSegments = async () => {
      const { data } = await supabase
        .from('call_transcript_segments')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: true });
      
      if (data) setSegments(data);
    };

    fetchSegments();

    // 2. Subscribe to new segments
    const channel = supabase
      .channel(`call-${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_transcript_segments',
          filter: `call_id=eq.${callId}`,
        },
        (payload) => {
          setSegments((prev) => [...prev, payload.new as TranscriptSegment]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  return (
    <div className="space-y-4 p-4 h-[400px] overflow-y-auto border rounded-lg">
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`flex ${
            segment.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              segment.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <p className="text-sm">{segment.content}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
```

### B. Integrate into Dashboard

Add the `<LiveTranscript />` component to the Call Details page (`app/(dashboard)/call-logs/[id]/page.tsx` or similar).

## 4. Execution Steps

1.  Run the SQL migration to create the table.
2.  Update the backend webhook handler.
3.  Build the frontend component.
4.  Test by making a call and observing the dashboard.
