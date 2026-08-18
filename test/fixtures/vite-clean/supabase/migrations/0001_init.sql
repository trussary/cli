create table notes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id),
  body text
);

alter table notes enable row level security;

create policy "own notes" on notes
  for all using (auth.uid() = owner);
