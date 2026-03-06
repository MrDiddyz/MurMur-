create extension if not exists pgcrypto;

create table users (
  id uuid primary key,
  email text,
  created_at timestamp default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  price integer,
  stripe_price_id text,
  created_at timestamp default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  product_id uuid references products(id),
  created_at timestamp default now()
);
