
create table if not exists billing_addons (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references company(id) not null,
  type text not null check (type in ('phone_number', 'call_recording', 'analytics', 'voice_training', 'priority_support', 'white_label')),
  quantity int default 1,
  cost_cents int not null,
  status text default 'active' check (status in ('active', 'canceled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table billing_addons enable row level security;

create policy "Users can view their company addons"
  on billing_addons for select
  using ( auth.uid() in (
    select id from users where company_id = billing_addons.company_id
  ));

-- Index for performance
create index idx_billing_addons_company_id on billing_addons(company_id);
