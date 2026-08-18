-- Intentionally vulnerable fixture: a public bucket for user uploads.
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', true);
