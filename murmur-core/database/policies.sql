alter table runs enable row level security;
create policy "owner read" on runs for select using (true);