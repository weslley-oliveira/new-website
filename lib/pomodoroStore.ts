import type { DashboardDatabase } from './supabaseAdmin';
import {
  createActivityFromPomodoro,
  type ActivityStatus,
  type PomodoroActivity,
  type PomodoroConfig,
  type PomodoroPhase,
  type PomodoroRunStatus,
  type PomodoroSessionRecord,
  type SavedPomodoro,
  type SavedPomodoroRun,
} from './pomodoro';
import { getSupabaseBrowserClient } from './supabaseBrowser';

type PomodoroRow = DashboardDatabase['public']['Tables']['pomodoros']['Row'];
type PomodoroInsert = DashboardDatabase['public']['Tables']['pomodoros']['Insert'];
type PomodoroUpdate = DashboardDatabase['public']['Tables']['pomodoros']['Update'];
type PomodoroRunRow = DashboardDatabase['public']['Tables']['pomodoro_runs']['Row'];
type PomodoroRunInsert = DashboardDatabase['public']['Tables']['pomodoro_runs']['Insert'];
type PomodoroRunUpdate = DashboardDatabase['public']['Tables']['pomodoro_runs']['Update'];
type PomodoroSessionRow = DashboardDatabase['public']['Tables']['pomodoro_sessions']['Row'];
type PomodoroSessionInsert = DashboardDatabase['public']['Tables']['pomodoro_sessions']['Insert'];

interface SavePomodoroInput extends PomodoroConfig {
  id?: string | null;
  userId: string;
  name: string;
}

interface SavePomodoroRunInput {
  id?: string | null;
  pomodoroId: string;
  userId: string;
  status: PomodoroRunStatus;
  currentPhase: PomodoroPhase;
  remainingSeconds: number;
  completedFocusSessions: number;
  currentCycle: number;
  startedAt: string;
  pausedAt?: string | null;
  completedAt?: string | null;
}

interface RecordPomodoroSessionInput {
  pomodoroId: string;
  userId: string;
  phaseType: PomodoroPhase;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  cycleIndex: number;
}

function mapPomodoroRow(row: PomodoroRow): SavedPomodoro {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    focusMinutes: row.focus_minutes,
    shortBreakMinutes: row.short_break_minutes,
    longBreakMinutes: row.long_break_minutes,
    cyclesUntilLongBreak: row.cycles_until_long_break,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPomodoroRunRow(row: PomodoroRunRow): SavedPomodoroRun {
  return {
    id: row.id,
    pomodoroId: row.pomodoro_id,
    userId: row.user_id,
    status: row.status,
    currentPhase: row.current_phase,
    remainingSeconds: row.remaining_seconds,
    completedFocusSessions: row.completed_focus_sessions,
    currentCycle: row.current_cycle,
    startedAt: row.started_at,
    pausedAt: row.paused_at,
    completedAt: row.completed_at,
    lastSyncedAt: row.last_synced_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPomodoroSessionRow(row: PomodoroSessionRow): PomodoroSessionRecord {
  return {
    id: row.id,
    pomodoroId: row.pomodoro_id,
    userId: row.user_id,
    phaseType: row.phase_type,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationSeconds: row.duration_seconds,
    cycleIndex: row.cycle_index,
    status: row.status,
  };
}

export async function listSavedPomodoros(userId: string) {
  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoros')
    .select(
      'id, user_id, name, focus_minutes, short_break_minutes, long_break_minutes, cycles_until_long_break, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load saved pomodoros: ${error.message}`);
  }

  return (data ?? []).map(mapPomodoroRow);
}

export async function listPomodoroRuns(userId: string) {
  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoro_runs')
    .select(
      'id, pomodoro_id, user_id, status, current_phase, remaining_seconds, completed_focus_sessions, current_cycle, started_at, paused_at, completed_at, last_synced_at, created_at, updated_at'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load pomodoro runs: ${error.message}`);
  }

  return (data ?? []).map(mapPomodoroRunRow);
}

export async function loadPomodoroActivities(userId: string): Promise<PomodoroActivity[]> {
  const [pomodoros, runs] = await Promise.all([listSavedPomodoros(userId), listPomodoroRuns(userId)]);
  const runByPomodoroId = new Map(runs.map((run) => [run.pomodoroId, run]));

  return pomodoros
    .map((pomodoro) => createActivityFromPomodoro(pomodoro, runByPomodoroId.get(pomodoro.id) ?? null))
    .sort((activityA, activityB) => activityB.updatedAt.localeCompare(activityA.updatedAt));
}

export async function savePomodoro({
  id,
  userId,
  name,
  focusMinutes,
  shortBreakMinutes,
  longBreakMinutes,
  cyclesUntilLongBreak,
}: SavePomodoroInput) {
  const payload: PomodoroInsert = {
    user_id: userId,
    name,
    focus_minutes: focusMinutes,
    short_break_minutes: shortBreakMinutes,
    long_break_minutes: longBreakMinutes,
    cycles_until_long_break: cyclesUntilLongBreak,
  };

  if (id) {
    payload.id = id;
  }

  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoros')
    .upsert(payload, {
      onConflict: 'id',
    })
    .select(
      'id, user_id, name, focus_minutes, short_break_minutes, long_break_minutes, cycles_until_long_break, created_at, updated_at'
    )
    .single();

  if (error) {
    throw new Error(`Could not save pomodoro: ${error.message}`);
  }

  return mapPomodoroRow(data);
}

export async function updatePomodoroConfig(
  pomodoroId: string,
  config: PomodoroConfig
): Promise<SavedPomodoro> {
  const payload: PomodoroUpdate = {
    focus_minutes: config.focusMinutes,
    short_break_minutes: config.shortBreakMinutes,
    long_break_minutes: config.longBreakMinutes,
    cycles_until_long_break: config.cyclesUntilLongBreak,
  };

  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoros')
    .update(payload)
    .eq('id', pomodoroId)
    .select(
      'id, user_id, name, focus_minutes, short_break_minutes, long_break_minutes, cycles_until_long_break, created_at, updated_at'
    )
    .single();

  if (error) {
    throw new Error(`Could not update pomodoro config: ${error.message}`);
  }

  return mapPomodoroRow(data);
}

export async function savePomodoroRun({
  id,
  pomodoroId,
  userId,
  status,
  currentPhase,
  remainingSeconds,
  completedFocusSessions,
  currentCycle,
  startedAt,
  pausedAt = null,
  completedAt = null,
}: SavePomodoroRunInput) {
  const payload: PomodoroRunInsert = {
    pomodoro_id: pomodoroId,
    user_id: userId,
    status,
    current_phase: currentPhase,
    remaining_seconds: remainingSeconds,
    completed_focus_sessions: completedFocusSessions,
    current_cycle: currentCycle,
    started_at: startedAt,
    paused_at: pausedAt,
    completed_at: completedAt,
    last_synced_at: new Date().toISOString(),
  };

  if (id) {
    payload.id = id;
  }

  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoro_runs')
    .upsert(payload, {
      onConflict: 'pomodoro_id',
    })
    .select(
      'id, pomodoro_id, user_id, status, current_phase, remaining_seconds, completed_focus_sessions, current_cycle, started_at, paused_at, completed_at, last_synced_at, created_at, updated_at'
    )
    .single();

  if (error) {
    throw new Error(`Could not save pomodoro run: ${error.message}`);
  }

  return mapPomodoroRunRow(data);
}

export async function updatePomodoroRunStatus(
  runId: string,
  status: PomodoroRunStatus,
  completedAt: string | null = null
) {
  const payload: PomodoroRunUpdate = {
    status,
    completed_at: completedAt,
    paused_at: status === 'paused' ? new Date().toISOString() : null,
    last_synced_at: new Date().toISOString(),
  };

  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoro_runs')
    .update(payload)
    .eq('id', runId)
    .select(
      'id, pomodoro_id, user_id, status, current_phase, remaining_seconds, completed_focus_sessions, current_cycle, started_at, paused_at, completed_at, last_synced_at, created_at, updated_at'
    )
    .single();

  if (error) {
    throw new Error(`Could not update pomodoro run status: ${error.message}`);
  }

  return mapPomodoroRunRow(data);
}

export async function markOtherPomodoroRunsIncomplete(
  userId: string,
  activePomodoroId: string | null
) {
  const query = getSupabaseBrowserClient()
    .from('pomodoro_runs')
    .update({
      status: 'incomplete',
      completed_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .in('status', ['active', 'paused']);

  const { error } = activePomodoroId
    ? await query.neq('pomodoro_id', activePomodoroId)
    : await query;

  if (error) {
    throw new Error(`Could not mark previous pomodoro runs as incomplete: ${error.message}`);
  }
}

export async function deletePomodoro(pomodoroId: string) {
  const { error } = await getSupabaseBrowserClient().from('pomodoros').delete().eq('id', pomodoroId);

  if (error) {
    throw new Error(`Could not delete pomodoro: ${error.message}`);
  }
}

export async function listPomodoroSessions(userId: string, limit = 12) {
  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoro_sessions')
    .select(
      'id, pomodoro_id, user_id, phase_type, started_at, completed_at, duration_seconds, cycle_index, status'
    )
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Could not load pomodoro history: ${error.message}`);
  }

  return (data ?? []).map(mapPomodoroSessionRow);
}

export async function recordPomodoroSession({
  pomodoroId,
  userId,
  phaseType,
  startedAt,
  completedAt,
  durationSeconds,
  cycleIndex,
}: RecordPomodoroSessionInput) {
  const payload: PomodoroSessionInsert = {
    pomodoro_id: pomodoroId,
    user_id: userId,
    phase_type: phaseType,
    started_at: startedAt,
    completed_at: completedAt,
    duration_seconds: durationSeconds,
    cycle_index: cycleIndex,
    status: 'completed',
  };

  const { data, error } = await getSupabaseBrowserClient()
    .from('pomodoro_sessions')
    .insert(payload)
    .select(
      'id, pomodoro_id, user_id, phase_type, started_at, completed_at, duration_seconds, cycle_index, status'
    )
    .single();

  if (error) {
    throw new Error(`Could not record pomodoro session: ${error.message}`);
  }

  return mapPomodoroSessionRow(data);
}
