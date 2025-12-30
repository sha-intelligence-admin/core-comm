-- Create security_settings table
create table if not exists security_settings (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) not null unique,
  two_factor_enabled boolean default false,
  allowed_auth_methods text[] default array['email', 'google', 'github'],
  session_timeout_minutes integer default 1440,
  ip_whitelist text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create audit_logs table
create table if not exists audit_logs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) not null,
  user_id uuid references auth.users(id),
  actor_name text,
  action text not null,
  resource text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_audit_logs_company on audit_logs(company_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);

-- Enable RLS
alter table security_settings enable row level security;
alter table audit_logs enable row level security;

-- Policies for security_settings
create policy "Users can view their company security settings"
  on security_settings for select
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

create policy "Admins can update their company security settings"
  on security_settings for update
  using (
    company_id in (
      select company_id from users where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert their company security settings"
  on security_settings for insert
  with check (
    company_id in (
      select company_id from users where id = auth.uid() and role = 'admin'
    )
  );

-- Policies for audit_logs
create policy "Users can view their company audit logs"
  on audit_logs for select
  using (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );

create policy "Users can insert audit logs for their company"
  on audit_logs for insert
  with check (
    company_id in (
      select company_id from users where id = auth.uid()
    )
  );
