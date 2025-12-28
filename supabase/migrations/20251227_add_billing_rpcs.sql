-- Function to safely increment wallet balance
create or replace function increment_wallet_balance(wallet_id uuid, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  update wallets
  set balance = balance + amount,
      updated_at = now()
  where id = wallet_id;
end;
$$;

-- Function to safely increment usage period counters
create or replace function increment_usage_period_counter(period_id uuid, field_name text, amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  if field_name = 'voice_minutes_used' then
    update billing_usage_periods
    set voice_minutes_used = voice_minutes_used + amount,
        updated_at = now()
    where id = period_id;
  elsif field_name = 'sms_count_used' then
    update billing_usage_periods
    set sms_count_used = sms_count_used + amount,
        updated_at = now()
    where id = period_id;
  elsif field_name = 'email_count_used' then
    update billing_usage_periods
    set email_count_used = email_count_used + amount,
        updated_at = now()
    where id = period_id;
  else
    raise exception 'Invalid field name: %', field_name;
  end if;
end;
$$;
