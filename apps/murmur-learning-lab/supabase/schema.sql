-- murmur-learning-lab schema
-- Run this in your Supabase SQL editor to set up the required tables.

create extension if not exists "pgcrypto";

-- Reflections: stores user reflections and AI-generated responses
create table if not exists public.reflections (
  id                  uuid primary key default gen_random_uuid(),
  content             text not null,
  mirror              text not null default '',
  insight             text not null default '',
  next_step           text not null default '',
  creative_suggestion text not null default '',
  created_at          timestamptz not null default now()
);

-- Learning nodes: derived knowledge units created from reflections
create table if not exists public.learning_nodes (
  id            uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references public.reflections(id) on delete cascade,
  title         text not null,
  summary       text not null,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_reflections_created_at
  on public.reflections(created_at desc);

create index if not exists idx_learning_nodes_reflection_id
  on public.learning_nodes(reflection_id);

create index if not exists idx_learning_nodes_created_at
  on public.learning_nodes(created_at desc);

-- Row Level Security (enable and allow public read/write for MVP)
alter table public.reflections enable row level security;
alter table public.learning_nodes enable row level security;

create policy "public_reflections_all" on public.reflections
  for all using (true) with check (true);

create policy "public_learning_nodes_all" on public.learning_nodes
  for all using (true) with check (true);
