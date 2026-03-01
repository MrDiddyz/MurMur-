create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.agent_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  temperature numeric(4,3) not null default 0.2 check (temperature >= 0 and temperature <= 1),
  reward_weight numeric(8,3) not null default 1,
  risk_weight numeric(8,3) not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  complexity numeric(8,3) not null default 1,
  risk numeric(8,3) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenario_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  score numeric(10,3) not null,
  proposals jsonb not null,
  settings_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.baselines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_workspace_member(w_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = w_id and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(w_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = w_id and wm.user_id = auth.uid() and wm.role = 'owner'
  );
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.agent_settings enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_runs enable row level security;
alter table public.baselines enable row level security;

create policy "workspaces select for members" on public.workspaces
for select using (public.is_workspace_member(id));

create policy "workspaces insert self" on public.workspaces
for insert with check (created_by = auth.uid());

create policy "workspaces update owner" on public.workspaces
for update using (public.is_workspace_owner(id)) with check (public.is_workspace_owner(id));

create policy "workspace_members select members" on public.workspace_members
for select using (public.is_workspace_member(workspace_id));

create policy "workspace_members insert owner" on public.workspace_members
for insert with check (public.is_workspace_owner(workspace_id));

create policy "workspace_members delete owner" on public.workspace_members
for delete using (public.is_workspace_owner(workspace_id));

create policy "agent_settings select members" on public.agent_settings
for select using (public.is_workspace_member(workspace_id));

create policy "agent_settings insert owner" on public.agent_settings
for insert with check (public.is_workspace_owner(workspace_id));

create policy "agent_settings update owner" on public.agent_settings
for update using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));

create policy "scenarios select members" on public.scenarios
for select using (public.is_workspace_member(workspace_id));

create policy "scenarios insert members created_by self" on public.scenarios
for insert with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "scenarios update members" on public.scenarios
for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

create policy "scenarios delete owner" on public.scenarios
for delete using (public.is_workspace_owner(workspace_id));

create policy "scenario_runs select members" on public.scenario_runs
for select using (public.is_workspace_member(workspace_id));

create policy "scenario_runs insert members created_by self" on public.scenario_runs
for insert with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "scenario_runs delete owner" on public.scenario_runs
for delete using (public.is_workspace_owner(workspace_id));

create policy "baselines select members" on public.baselines
for select using (public.is_workspace_member(workspace_id));

create policy "baselines insert members created_by self" on public.baselines
for insert with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "baselines delete owner" on public.baselines
for delete using (public.is_workspace_owner(workspace_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
  workspace_name text;
begin
  workspace_name := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'My Workspace');

  insert into public.workspaces (name, created_by)
  values (workspace_name || '''s Workspace', new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  insert into public.agent_settings (workspace_id, temperature, reward_weight, risk_weight)
  values (new_workspace_id, 0.2, 1, 1);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
