export type PomodoroPhase = 'focus' | 'short_break' | 'long_break';
export type PomodoroRunStatus = 'active' | 'paused' | 'completed' | 'incomplete';
export type PomodoroSessionStatus = 'completed';
export type ActivityStatus = 'active' | 'completed' | 'incomplete';

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
}

export interface SavedPomodoro extends PomodoroConfig {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedPomodoroRun {
  id: string;
  pomodoroId: string;
  userId: string;
  status: PomodoroRunStatus;
  currentPhase: PomodoroPhase;
  remainingSeconds: number;
  completedFocusSessions: number;
  currentCycle: number;
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroActivity {
  id: string;
  userId: string | null;
  name: string;
  status: ActivityStatus;
  config: PomodoroConfig;
  startedAt: string;
  updatedAt: string;
  runId: string | null;
  remainingSeconds: number;
  currentPhase: PomodoroPhase;
  completedFocusSessions: number;
  currentCycle: number;
  isPersisted: boolean;
}

export interface PomodoroSessionRecord {
  id: string;
  pomodoroId: string;
  userId: string;
  phaseType: PomodoroPhase;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  cycleIndex: number;
  status: PomodoroSessionStatus;
}

export interface LocalPomodoroHistoryEntry {
  id: string;
  phaseType: PomodoroPhase;
  completedAt: string;
  durationSeconds: number;
  cycleIndex: number;
}

export interface PomodoroSnapshot {
  currentPhase: PomodoroPhase;
  remainingSeconds: number;
  completedFocusSessions: number;
  currentCycle: number;
}

export const DEFAULT_FOCUS_MINUTES = 25;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 30;
export const DEFAULT_CYCLES_UNTIL_LONG_BREAK = 4;

const POMODORO_CONFIG_STORAGE_KEY = 'tools-pomodoro-config';

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  focusMinutes: DEFAULT_FOCUS_MINUTES,
  shortBreakMinutes: DEFAULT_SHORT_BREAK_MINUTES,
  longBreakMinutes: DEFAULT_LONG_BREAK_MINUTES,
  cyclesUntilLongBreak: DEFAULT_CYCLES_UNTIL_LONG_BREAK,
};

function clampMinutes(value: unknown, fallbackValue: number, minValue: number, maxValue: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallbackValue;
  }

  return Math.min(maxValue, Math.max(minValue, Math.round(value)));
}

export function sanitizePomodoroConfig(
  input: Partial<PomodoroConfig> | null | undefined
): PomodoroConfig {
  return {
    focusMinutes: clampMinutes(input?.focusMinutes, DEFAULT_FOCUS_MINUTES, 1, 180),
    shortBreakMinutes: clampMinutes(
      input?.shortBreakMinutes,
      DEFAULT_SHORT_BREAK_MINUTES,
      1,
      60
    ),
    longBreakMinutes: clampMinutes(input?.longBreakMinutes, DEFAULT_LONG_BREAK_MINUTES, 1, 120),
    cyclesUntilLongBreak: clampMinutes(
      input?.cyclesUntilLongBreak,
      DEFAULT_CYCLES_UNTIL_LONG_BREAK,
      2,
      8
    ),
  };
}

export function getPhaseLabel(phase: PomodoroPhase) {
  if (phase === 'focus') {
    return 'Focus';
  }

  if (phase === 'short_break') {
    return 'Short Break';
  }

  return 'Long Break';
}

export function getPhaseDurationSeconds(config: PomodoroConfig, phase: PomodoroPhase) {
  if (phase === 'focus') {
    return config.focusMinutes * 60;
  }

  if (phase === 'short_break') {
    return config.shortBreakMinutes * 60;
  }

  return config.longBreakMinutes * 60;
}

export function getCurrentCycle(phase: PomodoroPhase, completedFocusSessions: number) {
  if (phase === 'focus') {
    return completedFocusSessions + 1;
  }

  return Math.max(completedFocusSessions, 1);
}

export function getNextPhase(
  completedPhase: PomodoroPhase,
  completedFocusSessions: number,
  cyclesUntilLongBreak: number
): PomodoroPhase {
  if (completedPhase !== 'focus') {
    return 'focus';
  }

  if (completedFocusSessions % cyclesUntilLongBreak === 0) {
    return 'long_break';
  }

  return 'short_break';
}

export function getInitialPomodoroSnapshot(config: PomodoroConfig): PomodoroSnapshot {
  return {
    currentPhase: 'focus',
    remainingSeconds: getPhaseDurationSeconds(config, 'focus'),
    completedFocusSessions: 0,
    currentCycle: 1,
  };
}

export function createActivityFromPomodoro(
  pomodoro: SavedPomodoro,
  run: SavedPomodoroRun | null
): PomodoroActivity {
  const snapshot = run
    ? {
        currentPhase: run.currentPhase,
        remainingSeconds: run.remainingSeconds,
        completedFocusSessions: run.completedFocusSessions,
        currentCycle: run.currentCycle,
      }
    : getInitialPomodoroSnapshot(pomodoro);

  return {
    id: pomodoro.id,
    userId: pomodoro.userId,
    name: pomodoro.name,
    status: run?.status === 'paused' || run?.status === 'active' ? 'active' : run?.status ?? 'completed',
    config: {
      focusMinutes: pomodoro.focusMinutes,
      shortBreakMinutes: pomodoro.shortBreakMinutes,
      longBreakMinutes: pomodoro.longBreakMinutes,
      cyclesUntilLongBreak: pomodoro.cyclesUntilLongBreak,
    },
    startedAt: run?.startedAt ?? pomodoro.createdAt,
    updatedAt: run?.updatedAt ?? pomodoro.updatedAt,
    runId: run?.id ?? null,
    remainingSeconds: snapshot.remainingSeconds,
    currentPhase: snapshot.currentPhase,
    completedFocusSessions: snapshot.completedFocusSessions,
    currentCycle: snapshot.currentCycle,
    isPersisted: true,
  };
}

export function createLocalActivity(name: string, config: PomodoroConfig): PomodoroActivity {
  const createdAt = new Date().toISOString();
  const snapshot = getInitialPomodoroSnapshot(config);

  return {
    id: `local-${Date.now()}`,
    userId: null,
    name,
    status: 'active',
    config,
    startedAt: createdAt,
    updatedAt: createdAt,
    runId: null,
    remainingSeconds: snapshot.remainingSeconds,
    currentPhase: snapshot.currentPhase,
    completedFocusSessions: snapshot.completedFocusSessions,
    currentCycle: snapshot.currentCycle,
    isPersisted: false,
  };
}

export function formatTimerDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatMinutesLabel(minutes: number) {
  return `${minutes} min`;
}

export function readStoredPomodoroConfig() {
  if (typeof window === 'undefined') {
    return DEFAULT_POMODORO_CONFIG;
  }

  try {
    const storedConfig = window.localStorage.getItem(POMODORO_CONFIG_STORAGE_KEY);

    if (!storedConfig) {
      return DEFAULT_POMODORO_CONFIG;
    }

    return sanitizePomodoroConfig(JSON.parse(storedConfig) as Partial<PomodoroConfig>);
  } catch {
    return DEFAULT_POMODORO_CONFIG;
  }
}

export function writeStoredPomodoroConfig(config: PomodoroConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(POMODORO_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage failures to keep the timer usable.
  }
}
