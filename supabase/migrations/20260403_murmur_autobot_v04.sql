create extension if not exists pgcrypto;

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  hook text not null,
  script text not null,
  variation_label text not null,
  manifest_url text,
  mp4_url text,
  status text not null default 'draft' check (status in ('draft', 'rendered', 'posted', 'failed')),
  score numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'youtube', 'tiktok')),
  views integer not null default 0,
  likes integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  watch_time_sec numeric not null default 0,
  measured_at timestamptz not null default now()
);

create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  stat_date date not null,
  platform text not null,
  videos_posted integer not null default 0,
  total_views integer not null default 0,
  total_likes integer not null default 0,
  total_shares integer not null default 0,
  total_saves integer not null default 0,
  average_score numeric not null default 0,
  unique (stat_date, platform)
);

create table if not exists public.ab_tests (
  id uuid primary key default gen_random_uuid(),
  test_date date not null default current_date,
  video_a_id uuid not null references public.videos(id) on delete cascade,
  video_b_id uuid not null references public.videos(id) on delete cascade,
  winner_video_id uuid references public.videos(id) on delete set null,
  winning_reason text,
  created_at timestamptz not null default now()
);

create or replace function public.hook_performance()
returns table (
  hook text,
  avg_score numeric,
  total_videos bigint
)
language sql
as $$
  select
    v.hook,
    round(avg(v.score), 2) as avg_score,
    count(*) as total_videos
  from public.videos v
  group by v.hook
  order by avg_score desc;
$$;

create or replace function public.variation_performance()
returns table (
  variation_label text,
  avg_score numeric,
  total_videos bigint
)
language sql
as $$
  select
    v.variation_label,
    round(avg(v.score), 2) as avg_score,
    count(*) as total_videos
  from public.videos v
  group by v.variation_label
  order by avg_score desc;
$$;
