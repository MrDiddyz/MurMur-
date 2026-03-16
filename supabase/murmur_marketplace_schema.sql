-- Enable pgcrypto for UUID generation
create extension if not exists pgcrypto;

-- Users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  bio text,
  created_at timestamptz not null default now()
);

-- Works
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  prompt text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  status text not null default 'active' check (status in ('active', 'sold', 'cancelled'))
);

-- Sales
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete restrict,
  buyer_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_works_user_id on public.works(user_id);
create index if not exists idx_listings_work_id on public.listings(work_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_sales_buyer_id on public.sales(buyer_id);
