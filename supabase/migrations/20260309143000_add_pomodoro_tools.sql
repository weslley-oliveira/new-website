create extension if not exists pgcrypto;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.pomodoros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  focus_minutes integer not null check (focus_minutes > 0),
  short_break_minutes integer not null default 5 check (short_break_minutes > 0),
  long_break_minutes integer not null default 30 check (long_break_minutes > 0),
  cycles_until_long_break integer not null default 4 check (cycles_until_long_break >= 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  pomodoro_id uuid not null references public.pomodoros (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  phase_type text not null check (phase_type in ('focus', 'short_break', 'long_break')),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  cycle_index integer not null default 1 check (cycle_index >= 0),
  status text not null default 'completed' check (status in ('completed'))
);

create index if not exists pomodoros_user_id_updated_at_idx
  on public.pomodoros (user_id, updated_at desc);

create index if not exists pomodoro_sessions_user_id_completed_at_idx
  on public.pomodoro_sessions (user_id, completed_at desc);

drop trigger if exists pomodoros_set_updated_at on public.pomodoros;

create trigger pomodoros_set_updated_at
before update on public.pomodoros
for each row
execute function public.set_row_updated_at();

alter table public.pomodoros enable row level security;
alter table public.pomodoro_sessions enable row level security;

drop policy if exists "pomodoros_select_own" on public.pomodoros;
create policy "pomodoros_select_own"
  on public.pomodoros
  for select
  using (auth.uid() = user_id);

drop policy if exists "pomodoros_insert_own" on public.pomodoros;
create policy "pomodoros_insert_own"
  on public.pomodoros
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "pomodoros_update_own" on public.pomodoros;
create policy "pomodoros_update_own"
  on public.pomodoros
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "pomodoros_delete_own" on public.pomodoros;
create policy "pomodoros_delete_own"
  on public.pomodoros
  for delete
  using (auth.uid() = user_id);

drop policy if exists "pomodoro_sessions_select_own" on public.pomodoro_sessions;
create policy "pomodoro_sessions_select_own"
  on public.pomodoro_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "pomodoro_sessions_insert_own" on public.pomodoro_sessions;
create policy "pomodoro_sessions_insert_own"
  on public.pomodoro_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "pomodoro_sessions_delete_own" on public.pomodoro_sessions;
create policy "pomodoro_sessions_delete_own"
  on public.pomodoro_sessions
  for delete
  using (auth.uid() = user_id);
