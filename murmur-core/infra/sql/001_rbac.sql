-- Prisma-compatible RBAC baseline for session-gateway
create extension if not exists pgcrypto;

create table if not exists "Role" (
  id text primary key default gen_random_uuid()::text,
  name text not null unique
);

create table if not exists "Permission" (
  id text primary key default gen_random_uuid()::text,
  action text not null,
  "roleId" text not null references "Role"(id) on delete cascade,
  unique ("roleId", action)
);

create table if not exists "User" (
  id text primary key default gen_random_uuid()::text,
  email text not null unique,
  "roleId" text not null references "Role"(id) on delete restrict,
  "createdAt" timestamptz not null default now()
);

create table if not exists "Session" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id) on delete cascade,
  container text not null,
  "createdAt" timestamptz not null default now()
);

insert into "Role" (name)
values ('viewer'), ('operator'), ('admin')
on conflict (name) do nothing;

insert into "Permission" (action, "roleId")
select p.action, r.id
from (values
  ('viewer', 'session.read'),
  ('operator', 'session.read'),
  ('operator', 'session.start'),
  ('operator', 'session.stdin'),
  ('admin', 'session.read'),
  ('admin', 'session.start'),
  ('admin', 'session.stdin'),
  ('admin', 'session.stop')
) as p(role_name, action)
join "Role" r on r.name = p.role_name
on conflict ("roleId", action) do nothing;

insert into "User" (email, "roleId")
select 'admin@murmur.local', r.id
from "Role" r
where r.name = 'admin'
on conflict (email) do nothing;
