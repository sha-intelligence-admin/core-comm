-- Create billing_usage_periods table
create table if not exists billing_usage_periods (
  id uuid default gen_random_uuid() primary key,
  subscription_id uuid references billing_subscriptions(id) on delete cascade not null,
  company_id uuid references company(id) on delete cascade not null,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  
  -- Usage Counters
  voice_minutes_used numeric default 0 not null,
  sms_count_used integer default 0 not null,
  email_count_used integer default 0 not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(subscription_id, period_start)
);

-- Enable RLS
alter table billing_usage_periods enable row level security;

-- RLS Policies

-- View own usage periods
create policy "Companies can view their own usage periods"
  on billing_usage_periods for select
  using (
    company_id in (
      select company_id from organization_memberships
      where user_id = auth.uid()
    )
  );

-- Service Role Policies
create policy "Service role can manage usage periods"
  on billing_usage_periods for all
  using (true)
  with check (true);

-- Add comments
comment on table billing_usage_periods is 'Tracks usage (minutes, SMS, emails) for the current billing cycle against plan limits';
comment on column billing_usage_periods.voice_minutes_used is 'Total voice minutes used in this period';
comment on column billing_usage_periods.sms_count_used is 'Total SMS messages sent in this period';
comment on column billing_usage_periods.email_count_used is 'Total emails sent in this period';
