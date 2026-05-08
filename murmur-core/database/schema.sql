create table if not exists runs(id uuid primary key, type text, input text, signal_score int, created_at timestamptz default now());
create table if not exists decode_results(run_id uuid references runs(id), payload jsonb);
create table if not exists audit_results(run_id uuid references runs(id), payload jsonb);
create table if not exists council_results(run_id uuid references runs(id), payload jsonb);
create table if not exists reports(id uuid primary key, run_id uuid references runs(id), markdown text);
create table if not exists feedback_logs(id uuid primary key, run_id uuid references runs(id), feedback text);
create table if not exists agent_weights(agent text primary key, weight numeric);