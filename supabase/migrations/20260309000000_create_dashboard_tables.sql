create table if not exists public.visits (
  id uuid primary key,
  visitor_id text not null,
  path text not null,
  visited_at timestamptz not null,
  ip text,
  user_agent text
);

create index if not exists visits_visitor_id_idx on public.visits (visitor_id);
create index if not exists visits_visited_at_desc_idx on public.visits (visited_at desc);
create index if not exists visits_path_idx on public.visits (path);

create table if not exists public.contact_attempts (
  id uuid primary key,
  name text not null,
  email text not null,
  message text not null,
  submitted_at timestamptz not null,
  status text not null check (status in ('sent', 'failed')),
  ip text,
  user_agent text,
  error_message text
);

create index if not exists contact_attempts_submitted_at_desc_idx
  on public.contact_attempts (submitted_at desc);
create index if not exists contact_attempts_status_idx on public.contact_attempts (status);
create index if not exists contact_attempts_email_idx on public.contact_attempts (email);
