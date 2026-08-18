create table notes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id),
  title text,
  body text
);

alter table notes enable row level security;

create policy "own notes" on notes
  for all using (auth.uid() = owner);

-- A private bucket: created without public = true.
insert into storage.buckets (id, name)
values ('attachments', 'attachments');
