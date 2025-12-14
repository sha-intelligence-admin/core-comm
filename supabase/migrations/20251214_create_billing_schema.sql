-- Create billing_subscriptions table
create table if not exists billing_subscriptions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  plan_id text not null, -- 'starter', 'growth', 'scale'
  status text not null check (status in ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wallets table
create table if not exists wallets (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) on delete cascade not null unique,
  balance numeric default 0 not null, -- Stored in cents/smallest unit
  currency text default 'usd' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wallet_transactions table
create table if not exists wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references wallets(id) on delete cascade not null,
  amount numeric not null, -- Positive for credit, negative for debit
  type text not null check (type in ('top_up', 'usage', 'monthly_grant', 'bonus', 'refund', 'adjustment')),
  reference_id text, -- Stripe Payment Intent ID or Call ID
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create usage_logs table
create table if not exists usage_logs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references company(id) on delete cascade not null,
  resource_type text not null, -- 'voice_inbound', 'voice_outbound', 'phone_number_rental'
  quantity numeric not null, -- e.g., minutes
  cost numeric not null, -- Cost in cents
  meta jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table billing_subscriptions enable row level security;
alter table wallets enable row level security;
alter table wallet_transactions enable row level security;
alter table usage_logs enable row level security;

-- RLS Policies

-- Billing Subscriptions: View own subscription
create policy "Companies can view their own subscription"
  on billing_subscriptions for select
  using (
    company_id in (
      select company_id from organization_memberships
      where user_id = auth.uid()
    )
  );

-- Wallets: View own wallet
create policy "Companies can view their own wallet"
  on wallets for select
  using (
    company_id in (
      select company_id from organization_memberships
      where user_id = auth.uid()
    )
  );

-- Wallet Transactions: View own transactions
create policy "Companies can view their own wallet transactions"
  on wallet_transactions for select
  using (
    wallet_id in (
      select id from wallets
      where company_id in (
        select company_id from organization_memberships
        where user_id = auth.uid()
      )
    )
  );

-- Usage Logs: View own usage logs
create policy "Companies can view their own usage logs"
  on usage_logs for select
  using (
    company_id in (
      select company_id from organization_memberships
      where user_id = auth.uid()
    )
  );

-- Service Role Policies (for Webhooks/Backend)
create policy "Service role can manage subscriptions"
  on billing_subscriptions for all
  using (true)
  with check (true);

create policy "Service role can manage wallets"
  on wallets for all
  using (true)
  with check (true);

create policy "Service role can manage wallet transactions"
  on wallet_transactions for all
  using (true)
  with check (true);

create policy "Service role can manage usage logs"
  on usage_logs for all
  using (true)
  with check (true);

-- Trigger to update updated_at on billing_subscriptions
create trigger update_billing_subscriptions_updated_at
  before update on billing_subscriptions
  for each row
  execute function update_updated_at_column();

-- Trigger to update updated_at on wallets
create trigger update_wallets_updated_at
  before update on wallets
  for each row
  execute function update_updated_at_column();

-- RPC Function to safely increment wallet balance
create or replace function increment_wallet_balance(wallet_id uuid, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  update wallets
  set balance = balance + amount,
      updated_at = timezone('utc'::text, now())
  where id = wallet_id;
end;
$$;
