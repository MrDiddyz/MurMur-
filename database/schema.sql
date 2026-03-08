-- MurMurLab payments schema additions

create table if not exists public.artists (
  id uuid primary key,
  stripe_account_id text unique,
  subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id uuid primary key,
  artist_id uuid not null references public.artists(id),
  title text,
  price_cents integer not null check (price_cents > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id),
  artist_id uuid not null references public.artists(id),
  buyer_email text,
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent text,
  gross_amount integer not null,
  platform_fee integer not null,
  artist_payout integer not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_subscriptions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid unique not null references public.artists(id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null,
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id),
  stripe_subscription_id text,
  stripe_invoice_id text,
  amount integer not null,
  status text not null,
  created_at timestamptz not null default now()
);
