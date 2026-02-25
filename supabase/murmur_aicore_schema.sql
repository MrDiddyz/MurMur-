-- MurMurAiCore Supabase schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  stripe_price_id text unique,
  vipps_plan_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  stripe_subscription_id text unique,
  status text not null check (status in ('trialing','active','past_due','canceled','incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  capability text not null,
  granted boolean not null default true,
  unique (subscription_id, capability)
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  published boolean not null default false
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  position int not null,
  title text not null,
  unique (track_id, position)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels(id) on delete cascade,
  position int not null,
  title text not null,
  unique (level_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  position int not null,
  title text not null,
  video_url text,
  text_content text,
  exercise_prompt text,
  reflection_prompt text,
  quiz_payload jsonb,
  unique (module_id, position)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  assignment_submitted boolean not null default false,
  completed_at timestamptz,
  unique (lesson_id, user_id)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, track_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  instructions text not null,
  rubric jsonb
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content jsonb not null,
  score numeric,
  submitted_at timestamptz not null default now()
);

create table if not exists public.community_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('explorer','practitioner','integrator','certified','ambassador')),
  assigned_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  ambassador_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid references public.profiles(id) on delete set null,
  referral_code text unique not null,
  status text not null default 'pending' check (status in ('pending','converted','rewarded')),
  reward_amount numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id uuid not null references public.levels(id),
  verification_id text unique not null,
  issued_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','revoked'))
);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.enrollments enable row level security;
alter table public.submissions enable row level security;
alter table public.community_roles enable row level security;
alter table public.referrals enable row level security;
alter table public.certificates enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "subscriptions_select_own" on public.subscriptions
for select using (auth.uid() = user_id);

create policy "entitlements_select_own" on public.entitlements
for select using (
  exists (
    select 1 from public.subscriptions s
    where s.id = entitlements.subscription_id and s.user_id = auth.uid()
  )
);

create policy "lesson_progress_owner_rw" on public.lesson_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "enrollments_owner_rw" on public.enrollments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "submissions_owner_rw" on public.submissions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "community_roles_owner_select" on public.community_roles
for select using (auth.uid() = user_id);

create policy "referrals_owner_select" on public.referrals
for select using (auth.uid() = ambassador_id or auth.uid() = invitee_id);

create policy "certificates_owner_select" on public.certificates
for select using (auth.uid() = user_id);

-- Public read for published curriculum
alter table public.tracks enable row level security;
alter table public.levels enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;

create policy "tracks_public_read" on public.tracks for select using (published = true);
create policy "levels_public_read" on public.levels for select using (true);
create policy "modules_public_read" on public.modules for select using (true);
create policy "lessons_public_read" on public.lessons for select using (true);
