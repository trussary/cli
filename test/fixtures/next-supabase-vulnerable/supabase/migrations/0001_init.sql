-- Intentionally vulnerable fixture: tables with no RLS anywhere.
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text
);

create table messages (
  id bigint generated always as identity primary key,
  user_id uuid references users (id),
  body text not null
);
