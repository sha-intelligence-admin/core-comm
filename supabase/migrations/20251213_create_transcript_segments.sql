-- Create table for real-time transcript segments
create table if not exists call_transcript_segments (
  id uuid default gen_random_uuid() primary key,
  call_id text references calls(id) on delete cascade not null,
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
