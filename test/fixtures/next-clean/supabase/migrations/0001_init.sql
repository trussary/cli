create table profiles (
  id uuid primary key references auth.users (id),
  display_name text
);

alter table profiles enable row level security;

create policy "own profile" on profiles
  for select using (auth.uid() = id);
