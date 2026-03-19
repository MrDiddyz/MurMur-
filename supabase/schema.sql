create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  email text not null,
  stripe_customer_id text unique,
  vipps_customer_ref text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'vipps')),
  provider_subscription_id text,
  plan_code text not null check (plan_code in ('starter', 'growth', 'vipps_startpakke')),
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_customers_stripe_customer_id on public.customers(stripe_customer_id);
create index if not exists idx_subscriptions_customer_id on public.subscriptions(customer_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_events_provider_event_id on public.events(provider, provider_event_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);
