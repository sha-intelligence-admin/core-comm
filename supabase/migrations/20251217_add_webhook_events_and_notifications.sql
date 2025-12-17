-- Create webhook_events table to ensure idempotent webhook processing
create table if not exists webhook_events (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,
  event_type text,
  processed boolean default false not null,
  processed_at timestamp with time zone,
  raw jsonb,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create billing_notifications table to record important billing events for downstream processing (emails, UI)
create table if not exists billing_notifications (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) on delete cascade,
  type text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Grant service role access for backend operations
alter table webhook_events enable row level security;
create policy "Service role can manage webhook events" on webhook_events for all using (true) with check (true);

alter table billing_notifications enable row level security;
create policy "Service role can manage billing notifications" on billing_notifications for all using (true) with check (true);
