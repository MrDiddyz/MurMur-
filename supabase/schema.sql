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

create table if not exists public.lipsync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  script text not null,
  image_path text not null,
  voice_path text,
  video_path text,
  provider_tts text not null default 'elevenlabs' check (provider_tts in ('elevenlabs')),
  provider_lipsync text not null default 'did' check (provider_lipsync in ('did', 'heygen')),
  status text not null check (status in ('queued', 'voice_generating', 'voice_ready', 'lipsync_generating', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lipsync_job_events (
  id bigint generated always as identity primary key,
  job_id uuid not null references public.lipsync_jobs(id) on delete cascade,
  user_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_lipsync_jobs_user_id on public.lipsync_jobs(user_id);
create index if not exists idx_lipsync_jobs_status on public.lipsync_jobs(status);
create index if not exists idx_lipsync_jobs_created_at on public.lipsync_jobs(created_at desc);
create index if not exists idx_lipsync_job_events_job_id on public.lipsync_job_events(job_id);
create index if not exists idx_lipsync_job_events_user_id on public.lipsync_job_events(user_id);

alter table public.lipsync_jobs enable row level security;
alter table public.lipsync_job_events enable row level security;

drop policy if exists "lipsync_jobs_select_own" on public.lipsync_jobs;
create policy "lipsync_jobs_select_own"
  on public.lipsync_jobs
  for select
  using (auth.uid()::text = user_id);

drop policy if exists "lipsync_jobs_insert_own" on public.lipsync_jobs;
create policy "lipsync_jobs_insert_own"
  on public.lipsync_jobs
  for insert
  with check (auth.uid()::text = user_id);

drop policy if exists "lipsync_jobs_update_own" on public.lipsync_jobs;
create policy "lipsync_jobs_update_own"
  on public.lipsync_jobs
  for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

drop policy if exists "lipsync_jobs_delete_own" on public.lipsync_jobs;
create policy "lipsync_jobs_delete_own"
  on public.lipsync_jobs
  for delete
  using (auth.uid()::text = user_id);

drop policy if exists "lipsync_job_events_select_own" on public.lipsync_job_events;
create policy "lipsync_job_events_select_own"
  on public.lipsync_job_events
  for select
  using (auth.uid()::text = user_id);

drop policy if exists "lipsync_job_events_insert_own" on public.lipsync_job_events;
create policy "lipsync_job_events_insert_own"
  on public.lipsync_job_events
  for insert
  with check (auth.uid()::text = user_id);

insert into storage.buckets (id, name, public)
values
  ('images', 'images', false),
  ('audio', 'audio', false),
  ('videos', 'videos', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own_lipsync" on storage.objects;
create policy "storage_select_own_lipsync"
  on storage.objects
  for select
  using (
    bucket_id in ('images', 'audio', 'videos')
    and split_part(name, '/', 1) = 'users'
    and split_part(name, '/', 2) = auth.uid()::text
  );

drop policy if exists "storage_insert_own_lipsync" on storage.objects;
create policy "storage_insert_own_lipsync"
  on storage.objects
  for insert
  with check (
    bucket_id in ('images', 'audio', 'videos')
    and split_part(name, '/', 1) = 'users'
    and split_part(name, '/', 2) = auth.uid()::text
  );

drop policy if exists "storage_delete_own_lipsync" on storage.objects;
create policy "storage_delete_own_lipsync"
  on storage.objects
  for delete
  using (
    bucket_id in ('images', 'audio', 'videos')
    and split_part(name, '/', 1) = 'users'
    and split_part(name, '/', 2) = auth.uid()::text
  );
