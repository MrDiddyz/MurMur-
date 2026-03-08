create extension if not exists pgcrypto;

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  genre text,
  release_date date,
  status text not null default 'draft',
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  name text not null,
  objective text,
  budget numeric(12,2),
  status text not null default 'planned',
  created_at timestamptz not null default now()
);

create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  platform text not null,
  content_type text not null,
  hook text,
  caption text,
  asset_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_targets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  playlist_name text not null,
  curator_name text,
  contact_email text,
  platform text not null,
  status text not null default 'new',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  platform text not null,
  metric_date date not null,
  streams bigint not null default 0,
  views bigint not null default 0,
  likes bigint not null default 0,
  comments bigint not null default 0,
  shares bigint not null default 0,
  saves bigint not null default 0,
  followers_gained bigint not null default 0,
  created_at timestamptz not null default now(),
  unique(campaign_id, platform, metric_date)
);

create table if not exists public.scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  job_type text not null,
  run_at timestamptz not null,
  status text not null default 'pending',
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_releases_artist_id on public.releases(artist_id);
create index if not exists idx_campaigns_release_id on public.campaigns(release_id);
create index if not exists idx_content_packs_campaign_id on public.content_packs(campaign_id);
create index if not exists idx_playlist_targets_campaign_id on public.playlist_targets(campaign_id);
create index if not exists idx_analytics_snapshots_campaign_id on public.analytics_snapshots(campaign_id);
create index if not exists idx_scheduled_jobs_campaign_id on public.scheduled_jobs(campaign_id);
create index if not exists idx_scheduled_jobs_run_at on public.scheduled_jobs(run_at);
