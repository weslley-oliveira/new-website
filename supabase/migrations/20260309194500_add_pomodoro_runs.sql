create table if not exists public.pomodoro_runs (
  id uuid primary key default gen_random_uuid(),
  pomodoro_id uuid not null unique references public.pomodoros (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('active', 'paused', 'completed', 'incomplete')),
  current_phase text not null check (current_phase in ('focus', 'short_break', 'long_break')),
  remaining_seconds integer not null check (remaining_seconds >= 0),
  completed_focus_sessions integer not null default 0 check (completed_focus_sessions >= 0),
  current_cycle integer not null default 1 check (current_cycle >= 1),
  started_at timestamptz not null default timezone('utc', now()),
  paused_at timestamptz,
  completed_at timestamptz,
  last_synced_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists pomodoro_runs_user_id_updated_at_idx
  on public.pomodoro_runs (user_id, updated_at desc);

create unique index if not exists pomodoro_runs_single_open_run_per_user_idx
  on public.pomodoro_runs (user_id)
  where status in ('active', 'paused');

drop trigger if exists pomodoro_runs_set_updated_at on public.pomodoro_runs;

create trigger pomodoro_runs_set_updated_at
before update on public.pomodoro_runs
for each row
execute function public.set_row_updated_at();

alter table public.pomodoro_runs enable row level security;

drop policy if exists "pomodoro_runs_select_own" on public.pomodoro_runs;
create policy "pomodoro_runs_select_own"
  on public.pomodoro_runs
  for select
  using (auth.uid() = user_id);

drop policy if exists "pomodoro_runs_insert_own" on public.pomodoro_runs;
create policy "pomodoro_runs_insert_own"
  on public.pomodoro_runs
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "pomodoro_runs_update_own" on public.pomodoro_runs;
create policy "pomodoro_runs_update_own"
  on public.pomodoro_runs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "pomodoro_runs_delete_own" on public.pomodoro_runs;
create policy "pomodoro_runs_delete_own"
  on public.pomodoro_runs
  for delete
  using (auth.uid() = user_id);
