import Head from 'next/head';
import type { NextPage } from 'next';
import type { User } from '@supabase/supabase-js';
import Modal from 'react-modal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Reveal } from '../components/Reveal';
import {
  createLocalActivity,
  DEFAULT_POMODORO_CONFIG,
  formatMinutesLabel,
  formatTimerDuration,
  getCurrentCycle,
  getInitialPomodoroSnapshot,
  getNextPhase,
  getPhaseDurationSeconds,
  getPhaseLabel,
  readStoredPomodoroConfig,
  sanitizePomodoroConfig,
  type ActivityStatus,
  type LocalPomodoroHistoryEntry,
  type PomodoroActivity,
  type PomodoroConfig,
  type PomodoroPhase,
  type PomodoroRunStatus,
  writeStoredPomodoroConfig,
} from '../lib/pomodoro';
import {
  deletePomodoro,
  loadPomodoroActivities,
  markOtherPomodoroRunsIncomplete,
  recordPomodoroSession,
  savePomodoro,
  savePomodoroRun,
  updatePomodoroConfig,
} from '../lib/pomodoroStore';
import { getSupabaseBrowserClient } from '../lib/supabaseBrowser';
import {
  BsPlayFill,
  BsPauseFill,
  BsSkipForwardFill,
  BsTrashFill,
  BsCheckLg,
  BsClock,
  BsChevronDown,
} from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/Tools.module.scss';

type TimerStatus = 'idle' | 'running' | 'paused';
type ToolId = 'pomodoro';

const LOCAL_HISTORY_LIMIT = 8;

const TOOLS: { id: ToolId; label: string; icon: typeof BsClock }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: BsClock },
];

function formatDateTime(dateValue: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue));
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

function getPhasePillClassName(phase: PomodoroPhase) {
  if (phase === 'focus') {
    return `${styles.phasePill} ${styles.phaseFocus}`;
  }

  if (phase === 'short_break') {
    return `${styles.phasePill} ${styles.phaseShortBreak}`;
  }

  return `${styles.phasePill} ${styles.phaseLongBreak}`;
}

function getStatusPillClassName(status: ActivityStatus) {
  if (status === 'active') {
    return `${styles.phasePill} ${styles.phaseFocus}`;
  }

  if (status === 'completed') {
    return `${styles.phasePill} ${styles.phaseShortBreak}`;
  }

  return `${styles.phasePill} ${styles.phaseLongBreak}`;
}

function getStatusLabel(status: ActivityStatus) {
  if (status === 'active') {
    return 'In Progress';
  }

  if (status === 'completed') {
    return 'Completed';
  }

  return 'Incomplete';
}

function sortActivities(activityItems: PomodoroActivity[]) {
  const statusOrder: Record<ActivityStatus, number> = {
    active: 0,
    incomplete: 1,
    completed: 2,
  };

  return [...activityItems].sort((activityA, activityB) => {
    const statusDifference = statusOrder[activityA.status] - statusOrder[activityB.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return activityB.updatedAt.localeCompare(activityA.updatedAt);
  });
}

const ToolsPage: NextPage = () => {
  const [config, setConfig] = useState(DEFAULT_POMODORO_CONFIG);
  const [setupDraft, setSetupDraft] = useState(DEFAULT_POMODORO_CONFIG);
  const [pendingActivityName, setPendingActivityName] = useState('');
  const [activePhase, setActivePhase] = useState<PomodoroPhase>('focus');
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(
    getPhaseDurationSeconds(DEFAULT_POMODORO_CONFIG, 'focus')
  );
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [localHistory, setLocalHistory] = useState<LocalPomodoroHistoryEntry[]>([]);
  const [activityItems, setActivityItems] = useState<PomodoroActivity[]>([]);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolId>('pomodoro');
  const [isToolsMenuExpanded, setIsToolsMenuExpanded] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const targetTimeRef = useRef<number | null>(null);
  const phaseStartedAtRef = useRef<string | null>(null);
  const isCompletingPhaseRef = useRef(false);
  const hasLoadedConfigRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);

  const activeActivity = useMemo(
    () => activityItems.find((activityItem) => activityItem.id === activeActivityId) ?? null,
    [activeActivityId, activityItems]
  );

  const currentCycleNumber = getCurrentCycle(activePhase, completedFocusSessions);

  const resetTimerState = useCallback((nextConfig: PomodoroConfig) => {
    targetTimeRef.current = null;
    phaseStartedAtRef.current = null;
    isCompletingPhaseRef.current = false;
    setTimerStatus('idle');
    setActiveActivityId(null);
    setActivePhase('focus');
    setCompletedFocusSessions(0);
    setRemainingSeconds(getPhaseDurationSeconds(nextConfig, 'focus'));
  }, []);

  const buildSnapshot = useCallback(
    (activityItem?: PomodoroActivity | null) => {
      if (!activityItem) {
        return getInitialPomodoroSnapshot(config);
      }

      if (activityItem.id !== activeActivityId) {
        return {
          currentPhase: activityItem.currentPhase,
          remainingSeconds: activityItem.remainingSeconds,
          completedFocusSessions: activityItem.completedFocusSessions,
          currentCycle: activityItem.currentCycle,
        };
      }

      return {
        currentPhase: activePhase,
        remainingSeconds,
        completedFocusSessions,
        currentCycle: currentCycleNumber,
      };
    },
    [activeActivityId, activePhase, completedFocusSessions, config, currentCycleNumber, remainingSeconds]
  );

  const updateActivityItem = useCallback(
    (
      activityId: string,
      nextStatus: ActivityStatus,
      snapshot: {
        currentPhase: PomodoroPhase;
        remainingSeconds: number;
        completedFocusSessions: number;
        currentCycle: number;
      },
      extraPatch: Partial<PomodoroActivity> = {},
      preserveOrder = false
    ) => {
      const updatedAt = new Date().toISOString();

      setActivityItems((currentActivityItems) => {
        const mapped = currentActivityItems.map((activityItem) =>
          activityItem.id === activityId
            ? {
                ...activityItem,
                status: nextStatus,
                currentPhase: snapshot.currentPhase,
                remainingSeconds: snapshot.remainingSeconds,
                completedFocusSessions: snapshot.completedFocusSessions,
                currentCycle: snapshot.currentCycle,
                updatedAt,
                ...extraPatch,
              }
            : activityItem
        );
        return preserveOrder ? mapped : sortActivities(mapped);
      });
    },
    []
  );

  const syncTimerWithActivity = useCallback((activityItem: PomodoroActivity, nextTimerStatus: TimerStatus) => {
    setConfig(activityItem.config);
    setSetupDraft(activityItem.config);
    setActiveActivityId(activityItem.id);
    setActivePhase(activityItem.currentPhase);
    setRemainingSeconds(activityItem.remainingSeconds);
    setCompletedFocusSessions(activityItem.completedFocusSessions);
    setTimerStatus(nextTimerStatus);

    if (nextTimerStatus === 'running') {
      targetTimeRef.current = Date.now() + activityItem.remainingSeconds * 1000;
      phaseStartedAtRef.current = new Date().toISOString();
      return;
    }

    targetTimeRef.current = null;
    phaseStartedAtRef.current = null;
  }, []);

  const persistRemoteSnapshot = useCallback(
    async (
      activityItem: PomodoroActivity,
      runStatus: PomodoroRunStatus,
      snapshot = buildSnapshot(activityItem),
      completedAt: string | null = null
    ) => {
      if (!authUser || !activityItem.isPersisted) {
        return null;
      }

      return savePomodoroRun({
        id: activityItem.runId,
        pomodoroId: activityItem.id,
        userId: authUser.id,
        status: runStatus,
        currentPhase: snapshot.currentPhase,
        remainingSeconds: snapshot.remainingSeconds,
        completedFocusSessions: snapshot.completedFocusSessions,
        currentCycle: snapshot.currentCycle,
        startedAt: activityItem.startedAt,
        pausedAt: runStatus === 'paused' ? new Date().toISOString() : null,
        completedAt,
      });
    },
    [authUser, buildSnapshot]
  );

  const loadRemoteActivities = useCallback(
    async (user: User) => {
      setIsActivitiesLoading(true);
      setPageError(null);

      try {
        const nextActivities = await loadPomodoroActivities(user.id);
        setActivityItems(sortActivities(nextActivities));

        const openActivity = nextActivities.find((activityItem) => activityItem.status === 'active') ?? null;

        if (!openActivity) {
          resetTimerState(readStoredPomodoroConfig());
          return;
        }

        syncTimerWithActivity(openActivity, 'paused');

        try {
          const savedRun = await savePomodoroRun({
            id: openActivity.runId,
            pomodoroId: openActivity.id,
            userId: user.id,
            status: 'paused',
            currentPhase: openActivity.currentPhase,
            remainingSeconds: openActivity.remainingSeconds,
            completedFocusSessions: openActivity.completedFocusSessions,
            currentCycle: openActivity.currentCycle,
            startedAt: openActivity.startedAt,
            pausedAt: new Date().toISOString(),
            completedAt: null,
          });

          updateActivityItem(openActivity.id, 'active', {
            currentPhase: openActivity.currentPhase,
            remainingSeconds: openActivity.remainingSeconds,
            completedFocusSessions: openActivity.completedFocusSessions,
            currentCycle: openActivity.currentCycle,
          }, {
            runId: savedRun.id,
          });
        } catch (error) {
          setPageError(
            getErrorMessage(error, 'Could not refresh the saved paused snapshot for your current activity.')
          );
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not load your saved pomodoros.'));
      } finally {
        setIsActivitiesLoading(false);
      }
    },
    [resetTimerState, syncTimerWithActivity, updateActivityItem]
  );

  useEffect(() => {
    const storedConfig = readStoredPomodoroConfig();
    hasLoadedConfigRef.current = true;
    setConfig(storedConfig);
    setSetupDraft(storedConfig);
    setRemainingSeconds(getPhaseDurationSeconds(storedConfig, 'focus'));
  }, []);

  useEffect(() => {
    if (!hasLoadedConfigRef.current) {
      return;
    }

    writeStoredPomodoroConfig(config);
  }, [config]);

  useEffect(() => {
    let isMounted = true;

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) {
          return;
        }

        setAuthUser(session?.user ?? null);
      });

      void supabase.auth
        .getSession()
        .then(({ data, error }) => {
          if (!isMounted) {
            return;
          }

          if (error) {
            throw error;
          }

          setAuthUser(data.session?.user ?? null);
        })
        .catch((error: unknown) => {
          if (!isMounted) {
            return;
          }

          setPageError(getErrorMessage(error, 'Could not restore your Supabase session.'));
        })
        .finally(() => {
          if (isMounted) {
            setIsAuthLoading(false);
          }
        });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } catch (error) {
      setPageError(getErrorMessage(error, 'Supabase auth is not configured for the browser.'));
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      if (previousUserIdRef.current) {
        const storedConfig = readStoredPomodoroConfig();
        setActivityItems([]);
        setConfig(storedConfig);
        setSetupDraft(storedConfig);
        resetTimerState(storedConfig);
      }

      previousUserIdRef.current = null;
      return;
    }

    previousUserIdRef.current = authUser.id;
    void loadRemoteActivities(authUser);
  }, [authUser, loadRemoteActivities, resetTimerState]);

  useEffect(() => {
    if (timerStatus !== 'running') {
      return;
    }

    const intervalId = window.setInterval(() => {
      const targetTime = targetTimeRef.current;

      if (!targetTime) {
        return;
      }

      const nextRemainingSeconds = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setRemainingSeconds((currentRemainingSeconds) =>
        currentRemainingSeconds === nextRemainingSeconds ? currentRemainingSeconds : nextRemainingSeconds
      );
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [timerStatus]);

  const completeActivePhase = useCallback(async () => {
    if (!activeActivity || isCompletingPhaseRef.current) {
      return;
    }

    isCompletingPhaseRef.current = true;

    const completedPhase = activePhase;
    const completedAt = new Date().toISOString();
    const durationSeconds = getPhaseDurationSeconds(activeActivity.config, completedPhase);
    const startedAt =
      phaseStartedAtRef.current ?? new Date(Date.now() - durationSeconds * 1000).toISOString();
    const nextCompletedFocusSessions =
      completedPhase === 'focus' ? completedFocusSessions + 1 : completedFocusSessions;
    const cycleIndex = completedPhase === 'focus' ? nextCompletedFocusSessions : completedFocusSessions;

    setLocalHistory((currentHistory) =>
      [
        {
          id: `local-${completedAt}-${completedPhase}`,
          phaseType: completedPhase,
          completedAt,
          durationSeconds,
          cycleIndex,
        },
        ...currentHistory,
      ].slice(0, LOCAL_HISTORY_LIMIT)
    );

    if (authUser && activeActivity.isPersisted) {
      try {
        await recordPomodoroSession({
          pomodoroId: activeActivity.id,
          userId: authUser.id,
          phaseType: completedPhase,
          startedAt,
          completedAt,
          durationSeconds,
          cycleIndex,
        });
      } catch (error) {
        setPageError(getErrorMessage(error, 'The phase finished, but the history entry could not be saved.'));
      }
    }

    const isPomodoroCompleted =
      completedPhase === 'long_break' &&
      nextCompletedFocusSessions >= activeActivity.config.cyclesUntilLongBreak;

    if (isPomodoroCompleted) {
      const completedSnapshot = {
        currentPhase: completedPhase,
        remainingSeconds: 0,
        completedFocusSessions: nextCompletedFocusSessions,
        currentCycle: activeActivity.config.cyclesUntilLongBreak,
      };

      updateActivityItem(activeActivity.id, 'completed', completedSnapshot);

      if (authUser && activeActivity.isPersisted) {
        try {
          const savedRun = await persistRemoteSnapshot(
            activeActivity,
            'completed',
            completedSnapshot,
            completedAt
          );

          if (savedRun) {
            updateActivityItem(activeActivity.id, 'completed', completedSnapshot, {
              runId: savedRun.id,
            });
          }
        } catch (error) {
          setPageError(getErrorMessage(error, 'Could not save the completed pomodoro snapshot.'));
        }
      }

      resetTimerState(activeActivity.config);
      isCompletingPhaseRef.current = false;
      return;
    }

    const nextPhase = getNextPhase(
      completedPhase,
      nextCompletedFocusSessions,
      activeActivity.config.cyclesUntilLongBreak
    );
    const nextRemainingForPhase = getPhaseDurationSeconds(activeActivity.config, nextPhase);
    const nextSnapshot = {
      currentPhase: nextPhase,
      remainingSeconds: nextRemainingForPhase,
      completedFocusSessions: nextCompletedFocusSessions,
      currentCycle: getCurrentCycle(nextPhase, nextCompletedFocusSessions),
    };

    setActivePhase(nextPhase);
    setRemainingSeconds(nextRemainingForPhase);
    setCompletedFocusSessions(nextCompletedFocusSessions);
    setTimerStatus('running');
    targetTimeRef.current = Date.now() + nextRemainingForPhase * 1000;
    phaseStartedAtRef.current = new Date().toISOString();
    updateActivityItem(activeActivity.id, 'active', nextSnapshot);

    if (authUser && activeActivity.isPersisted) {
      try {
        const savedRun = await persistRemoteSnapshot(activeActivity, 'active', nextSnapshot);

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not save the next phase snapshot.'));
      }
    }

    isCompletingPhaseRef.current = false;
  }, [
    activeActivity,
    activePhase,
    authUser,
    completedFocusSessions,
    persistRemoteSnapshot,
    resetTimerState,
    updateActivityItem,
  ]);

  useEffect(() => {
    if (timerStatus !== 'running' || remainingSeconds > 0) {
      return;
    }

    void completeActivePhase();
  }, [completeActivePhase, remainingSeconds, timerStatus]);

  const handlePauseTimer = useCallback(async () => {
    if (!activeActivity || timerStatus !== 'running') {
      return;
    }

    const targetTime = targetTimeRef.current;
    const nextRemaining = targetTime
      ? Math.max(0, Math.ceil((targetTime - Date.now()) / 1000))
      : remainingSeconds;
    const nextSnapshot = {
      currentPhase: activePhase,
      remainingSeconds: nextRemaining,
      completedFocusSessions,
      currentCycle: currentCycleNumber,
    };

    targetTimeRef.current = null;
    setRemainingSeconds(nextRemaining);
    setTimerStatus('paused');
    updateActivityItem(activeActivity.id, 'active', nextSnapshot);

    if (authUser && activeActivity.isPersisted) {
      try {
        const savedRun = await persistRemoteSnapshot(activeActivity, 'paused', nextSnapshot);

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not save the paused snapshot.'));
      }
    }
  }, [
    activeActivity,
    activePhase,
    authUser,
    completedFocusSessions,
    currentCycleNumber,
    persistRemoteSnapshot,
    remainingSeconds,
    timerStatus,
    updateActivityItem,
  ]);

  const handleResumeTimer = useCallback(async () => {
    if (!activeActivity || timerStatus !== 'paused') {
      return;
    }

    setTimerStatus('running');
    targetTimeRef.current = Date.now() + remainingSeconds * 1000;
    phaseStartedAtRef.current = new Date().toISOString();

    if (authUser && activeActivity.isPersisted) {
      const nextSnapshot = buildSnapshot(activeActivity);

      try {
        const savedRun = await persistRemoteSnapshot(activeActivity, 'active', nextSnapshot);

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not restore the running snapshot.'));
      }
    }
  }, [
    activeActivity,
    authUser,
    buildSnapshot,
    persistRemoteSnapshot,
    remainingSeconds,
    timerStatus,
    updateActivityItem,
  ]);

  const handleResetTimer = useCallback(async () => {
    if (!activeActivity) {
      return;
    }

    const nextSnapshot = getInitialPomodoroSnapshot(activeActivity.config);

    setActivePhase('focus');
    setCompletedFocusSessions(0);
    setRemainingSeconds(nextSnapshot.remainingSeconds);
    setTimerStatus('running');
    targetTimeRef.current = Date.now() + nextSnapshot.remainingSeconds * 1000;
    phaseStartedAtRef.current = new Date().toISOString();
    updateActivityItem(activeActivity.id, 'active', nextSnapshot);

    if (authUser && activeActivity.isPersisted) {
      try {
        const savedRun = await persistRemoteSnapshot(activeActivity, 'active', nextSnapshot);

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not save the reset snapshot.'));
      }
    }
  }, [activeActivity, authUser, persistRemoteSnapshot, updateActivityItem]);

  const handleSkipCycle = useCallback(async () => {
    if (!activeActivity || (timerStatus !== 'running' && timerStatus !== 'paused')) {
      return;
    }

    const { config } = activeActivity;
    const { cyclesUntilLongBreak } = config;
    let nextPhase: PomodoroPhase;
    let nextCompletedFocusSessions: number;

    if (activePhase === 'focus') {
      nextCompletedFocusSessions = completedFocusSessions + 1;
      nextPhase =
        nextCompletedFocusSessions >= cyclesUntilLongBreak ? 'long_break' : 'short_break';
    } else if (activePhase === 'short_break') {
      nextPhase = 'focus';
      nextCompletedFocusSessions = completedFocusSessions;
    } else {
      nextPhase = 'focus';
      nextCompletedFocusSessions = 0;
    }

    const nextRemainingForPhase = getPhaseDurationSeconds(config, nextPhase);
    const nextSnapshot = {
      currentPhase: nextPhase,
      remainingSeconds: nextRemainingForPhase,
      completedFocusSessions: nextCompletedFocusSessions,
      currentCycle: getCurrentCycle(nextPhase, nextCompletedFocusSessions),
    };

    setActivePhase(nextPhase);
    setRemainingSeconds(nextRemainingForPhase);
    setCompletedFocusSessions(nextCompletedFocusSessions);
    setTimerStatus('running');
    targetTimeRef.current = Date.now() + nextRemainingForPhase * 1000;
    phaseStartedAtRef.current = new Date().toISOString();
    updateActivityItem(activeActivity.id, 'active', nextSnapshot);

    if (authUser && activeActivity.isPersisted) {
      try {
        const savedRun = await persistRemoteSnapshot(activeActivity, 'active', nextSnapshot);

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not save the skip snapshot.'));
      }
    }
  }, [
    activeActivity,
    activePhase,
    authUser,
    completedFocusSessions,
    persistRemoteSnapshot,
    timerStatus,
    updateActivityItem,
  ]);

  useEffect(() => {
    if (!authUser || timerStatus !== 'running') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        void handlePauseTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authUser, handlePauseTimer, timerStatus]);

  function openSetupModal() {
    setSetupDraft(activeActivity?.config ?? config);
    setIsSetupOpen(true);
  }

  function closeSetupModal() {
    setIsSetupOpen(false);
  }

  function updateSetupDraft<K extends keyof PomodoroConfig>(key: K, value: PomodoroConfig[K]) {
    setSetupDraft((currentDraft) =>
      sanitizePomodoroConfig({
        ...currentDraft,
        [key]: value,
      })
    );
  }

  async function handleSaveSetup() {
    const nextConfig = sanitizePomodoroConfig(setupDraft);
    setConfig(nextConfig);
    setSetupDraft(nextConfig);

    if (!activeActivity) {
      setRemainingSeconds(getPhaseDurationSeconds(nextConfig, 'focus'));
      closeSetupModal();
      return;
    }

    const maxSecondsForCurrentPhase = getPhaseDurationSeconds(nextConfig, activePhase);
    const nextRemaining = Math.min(remainingSeconds, maxSecondsForCurrentPhase);
    const nextSnapshot = {
      currentPhase: activePhase,
      remainingSeconds: nextRemaining,
      completedFocusSessions,
      currentCycle: currentCycleNumber,
    };

    setRemainingSeconds(nextRemaining);
    updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
      config: nextConfig,
    });

    if (authUser && activeActivity.isPersisted) {
      try {
        await updatePomodoroConfig(activeActivity.id, nextConfig);
        const savedRun = await persistRemoteSnapshot(
          { ...activeActivity, config: nextConfig },
          timerStatus === 'paused' ? 'paused' : 'active',
          nextSnapshot
        );

        if (savedRun) {
          updateActivityItem(activeActivity.id, 'active', nextSnapshot, {
            config: nextConfig,
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not save the updated setup.'));
      }
    }

    closeSetupModal();
  }

  function openNewActivityModal() {
    setPendingActivityName('');
    setIsNewActivityOpen(true);
  }

  function closeNewActivityModal() {
    setIsNewActivityOpen(false);
  }

  async function handleCreateNewActivity() {
    const trimmedName = pendingActivityName.trim();

    if (!trimmedName) {
      setPageError('Add an activity name before starting.');
      return;
    }

    setPageError(null);

    if (activeActivity) {
      const incompleteSnapshot = buildSnapshot(activeActivity);
      updateActivityItem(activeActivity.id, 'incomplete', incompleteSnapshot);

      if (authUser && activeActivity.isPersisted) {
        try {
          await persistRemoteSnapshot(
            activeActivity,
            'incomplete',
            incompleteSnapshot,
            new Date().toISOString()
          );
        } catch (error) {
          setPageError(getErrorMessage(error, 'Could not mark the previous activity as incomplete.'));
        }
      }
    }

    const nextConfig = sanitizePomodoroConfig(config);

    if (!authUser) {
      const nextActivity = createLocalActivity(trimmedName, nextConfig);
      setActivityItems((currentActivityItems) => sortActivities([nextActivity, ...currentActivityItems]));
      syncTimerWithActivity(nextActivity, 'running');
      closeNewActivityModal();
      setPendingActivityName('');
      return;
    }

    try {
      await markOtherPomodoroRunsIncomplete(authUser.id, null);

      const savedPomodoro = await savePomodoro({
        userId: authUser.id,
        name: trimmedName,
        focusMinutes: nextConfig.focusMinutes,
        shortBreakMinutes: nextConfig.shortBreakMinutes,
        longBreakMinutes: nextConfig.longBreakMinutes,
        cyclesUntilLongBreak: nextConfig.cyclesUntilLongBreak,
      });

      const nextSnapshot = getInitialPomodoroSnapshot(nextConfig);
      const savedRun = await savePomodoroRun({
        pomodoroId: savedPomodoro.id,
        userId: authUser.id,
        status: 'active',
        currentPhase: nextSnapshot.currentPhase,
        remainingSeconds: nextSnapshot.remainingSeconds,
        completedFocusSessions: nextSnapshot.completedFocusSessions,
        currentCycle: nextSnapshot.currentCycle,
        startedAt: new Date().toISOString(),
      });

      const nextActivity: PomodoroActivity = {
        id: savedPomodoro.id,
        userId: savedPomodoro.userId,
        name: savedPomodoro.name,
        status: 'active',
        config: nextConfig,
        startedAt: savedRun.startedAt,
        updatedAt: savedRun.updatedAt,
        runId: savedRun.id,
        remainingSeconds: savedRun.remainingSeconds,
        currentPhase: savedRun.currentPhase,
        completedFocusSessions: savedRun.completedFocusSessions,
        currentCycle: savedRun.currentCycle,
        isPersisted: true,
      };

      setActivityItems((currentActivityItems) => sortActivities([nextActivity, ...currentActivityItems]));
      syncTimerWithActivity(nextActivity, 'running');
      closeNewActivityModal();
      setPendingActivityName('');
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not create the new saved activity.'));
    }
  }

  async function handleSelectPausedActivity(activityId: string) {
    if (timerStatus !== 'paused') {
      return;
    }

    const targetActivity = activityItems.find((item) => item.id === activityId);

    if (
      !targetActivity ||
      targetActivity.status === 'completed' ||
      targetActivity.id === activeActivityId
    ) {
      return;
    }

    setPageError(null);

    if (activeActivity && activeActivity.id !== targetActivity.id) {
      const previousSnapshot = buildSnapshot(activeActivity);
      updateActivityItem(
        activeActivity.id,
        'incomplete',
        previousSnapshot,
        { updatedAt: activeActivity.updatedAt },
        true
      );

      if (authUser && activeActivity.isPersisted) {
        try {
          await persistRemoteSnapshot(
            activeActivity,
            'incomplete',
            previousSnapshot,
            new Date().toISOString()
          );
        } catch (error) {
          setPageError(
            getErrorMessage(error, 'Could not save the current activity before switching.')
          );
          return;
        }
      }
    }

    const selectedSnapshot = {
      currentPhase: targetActivity.currentPhase,
      remainingSeconds: targetActivity.remainingSeconds,
      completedFocusSessions: targetActivity.completedFocusSessions,
      currentCycle: targetActivity.currentCycle,
    };

    const selectedActivity: PomodoroActivity = {
      ...targetActivity,
      status: 'active',
      updatedAt: targetActivity.updatedAt,
    };

    updateActivityItem(
      targetActivity.id,
      'active',
      selectedSnapshot,
      { updatedAt: targetActivity.updatedAt },
      true
    );
    syncTimerWithActivity(selectedActivity, 'paused');

    if (!authUser || !targetActivity.isPersisted) {
      return;
    }

    try {
      await markOtherPomodoroRunsIncomplete(authUser.id, targetActivity.id);

      const savedRun = await persistRemoteSnapshot(selectedActivity, 'paused', selectedSnapshot);

      if (savedRun) {
        updateActivityItem(
          targetActivity.id,
          'active',
          selectedSnapshot,
          { runId: savedRun.id, updatedAt: targetActivity.updatedAt },
          true
        );
      }
    } catch (error) {
      setPageError(
        getErrorMessage(error, 'Could not sync the selected pomodoro with your account.')
      );
    }
  }

  async function handleResumeIncompleteActivity(activityId: string) {
    const activityToResume = activityItems.find((activityItem) => activityItem.id === activityId);

    if (!activityToResume || activityToResume.status !== 'incomplete') {
      return;
    }

    setPageError(null);

    if (activeActivity && activeActivity.id !== activityToResume.id) {
      const previousActiveSnapshot = buildSnapshot(activeActivity);
      updateActivityItem(activeActivity.id, 'incomplete', previousActiveSnapshot);

      if (authUser && activeActivity.isPersisted) {
        try {
          await persistRemoteSnapshot(
            activeActivity,
            'incomplete',
            previousActiveSnapshot,
            new Date().toISOString()
          );
        } catch (error) {
          setPageError(getErrorMessage(error, 'Could not save the current activity before resuming another one.'));
          return;
        }
      }
    }

    const resumedSnapshot = {
      currentPhase: activityToResume.currentPhase,
      remainingSeconds: activityToResume.remainingSeconds,
      completedFocusSessions: activityToResume.completedFocusSessions,
      currentCycle: activityToResume.currentCycle,
    };

    const resumedActivity: PomodoroActivity = {
      ...activityToResume,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    updateActivityItem(activityToResume.id, 'active', resumedSnapshot);
    syncTimerWithActivity(resumedActivity, 'running');

    if (!authUser || !activityToResume.isPersisted) {
      return;
    }

    try {
      await markOtherPomodoroRunsIncomplete(authUser.id, activityToResume.id);

      const savedRun = await persistRemoteSnapshot(resumedActivity, 'active', resumedSnapshot);

      if (savedRun) {
        updateActivityItem(activityToResume.id, 'active', resumedSnapshot, {
          runId: savedRun.id,
        });
      }
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not resume the saved pomodoro from where it stopped.'));
    }
  }

  async function handleMarkAsCompleted(activityId: string) {
    const activityItem = activityItems.find((item) => item.id === activityId);

    if (!activityItem || activityItem.status === 'completed') {
      return;
    }

    const completedSnapshot = {
      currentPhase: 'long_break' as PomodoroPhase,
      remainingSeconds: 0,
      completedFocusSessions: activityItem.config.cyclesUntilLongBreak,
      currentCycle: activityItem.config.cyclesUntilLongBreak,
    };

    updateActivityItem(activityId, 'completed', completedSnapshot);

    if (authUser && activityItem.isPersisted) {
      try {
        const savedRun = await persistRemoteSnapshot(
          activityItem,
          'completed',
          completedSnapshot,
          new Date().toISOString()
        );

        if (savedRun) {
          updateActivityItem(activityId, 'completed', completedSnapshot, {
            runId: savedRun.id,
          });
        }
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not mark the activity as completed.'));
        return;
      }
    }

    if (activityId === activeActivityId) {
      resetTimerState(activityItem.config);
    }

    toast.success('Activity marked as completed.');
  }

  function openDeleteModal(activityId: string) {
    setDeleteActivityId(activityId);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setDeleteActivityId(null);
  }

  async function confirmDeleteActivity() {
    if (!deleteActivityId) {
      return;
    }

    const activityItem = activityItems.find((item) => item.id === deleteActivityId);

    if (!activityItem) {
      closeDeleteModal();
      return;
    }

    if (authUser && activityItem.isPersisted) {
      try {
        await deletePomodoro(deleteActivityId);
      } catch (error) {
        setPageError(getErrorMessage(error, 'Could not delete the activity.'));
        closeDeleteModal();
        return;
      }
    }

    setActivityItems((currentActivityItems) =>
      currentActivityItems.filter((activityItemToFilter) => activityItemToFilter.id !== deleteActivityId)
    );

    closeDeleteModal();
    toast.success('Activity deleted successfully.');
  }

  async function handleSignIn() {
    setPageError(null);
    setIsSigningIn(true);

    try {
      const redirectTo = `${window.location.origin}/tools`;
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not start Google sign-in.'));
      setIsSigningIn(false);
    }
  }

  return (
    <>
      <Head>
        <title>Tools | Dev Oliveira</title>
        <meta
          name="description"
          content="Pomodoro timer with optional Supabase sync and Google sign-in."
        />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>
          <Header />

          <Modal
            isOpen={isSetupOpen}
            onRequestClose={closeSetupModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Pomodoro setup"
          >
            <article className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.eyebrow}>Setup</p>
                  <h2>Adjust the clock parameters.</h2>
                  <p className={styles.panelCopy}>
                    Timer values are saved locally and, when signed in, also update the current saved
                    activity snapshot.
                  </p>
                </div>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeSetupModal}
                  aria-label="Close setup modal"
                >
                  Close
                </button>
              </div>

              <div className={styles.settingsFormGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Focus duration (minutes)</span>
                  <input
                    className={styles.input}
                    type="number"
                    name="focusMinutes"
                    min={1}
                    max={180}
                    value={setupDraft.focusMinutes}
                    onChange={(event) =>
                      updateSetupDraft('focusMinutes', Number.parseInt(event.target.value || '0', 10))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Short break (minutes)</span>
                  <input
                    className={styles.input}
                    type="number"
                    name="shortBreakMinutes"
                    min={1}
                    max={60}
                    value={setupDraft.shortBreakMinutes}
                    onChange={(event) =>
                      updateSetupDraft('shortBreakMinutes', Number.parseInt(event.target.value || '0', 10))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Long break (minutes)</span>
                  <input
                    className={styles.input}
                    type="number"
                    name="longBreakMinutes"
                    min={1}
                    max={120}
                    value={setupDraft.longBreakMinutes}
                    onChange={(event) =>
                      updateSetupDraft('longBreakMinutes', Number.parseInt(event.target.value || '0', 10))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Focus cycles before long break</span>
                  <input
                    className={styles.input}
                    type="number"
                    name="cyclesUntilLongBreak"
                    min={2}
                    max={8}
                    value={setupDraft.cyclesUntilLongBreak}
                    onChange={(event) =>
                      updateSetupDraft(
                        'cyclesUntilLongBreak',
                        Number.parseInt(event.target.value || '0', 10)
                      )
                    }
                  />
                </label>
              </div>

              <div className={styles.settingsGrid}>
                <article className={styles.settingCard}>
                  <span>Focus</span>
                  <strong>{formatMinutesLabel(setupDraft.focusMinutes)}</strong>
                </article>
                <article className={styles.settingCard}>
                  <span>Short break</span>
                  <strong>{formatMinutesLabel(setupDraft.shortBreakMinutes)}</strong>
                </article>
                <article className={styles.settingCard}>
                  <span>Long break</span>
                  <strong>{formatMinutesLabel(setupDraft.longBreakMinutes)}</strong>
                </article>
                <article className={styles.settingCard}>
                  <span>Long break cycle</span>
                  <strong>Every {setupDraft.cyclesUntilLongBreak} focus sessions</strong>
                </article>
              </div>

              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="button" onClick={() => void handleSaveSetup()}>
                  Done
                </button>
              </div>

              <p className={styles.helperText}>
                Setup changes are saved for the next run and for the current saved activity.
              </p>
            </article>
          </Modal>

          <Modal
            isOpen={isNewActivityOpen}
            onRequestClose={closeNewActivityModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="New activity"
          >
            <article className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.eyebrow}>New</p>
                  <h2>What will you work on today?</h2>
                </div>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeNewActivityModal}
                  aria-label="Close new activity modal"
                >
                  Close
                </button>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Activity name</span>
                <input
                  autoFocus
                  className={styles.input}
                  type="text"
                  name="newActivityName"
                  value={pendingActivityName}
                  maxLength={80}
                  placeholder="Deep work, writing, study session..."
                  onChange={(event) => setPendingActivityName(event.target.value)}
                />
              </label>

              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="button" onClick={() => void handleCreateNewActivity()}>
                  Start
                </button>
              </div>
            </article>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onRequestClose={closeDeleteModal}
            className={styles.modal}
            overlayClassName={styles.overlay}
            contentLabel="Delete activity confirmation"
          >
            <article className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.eyebrow}>Delete activity</p>
                  <h2>Are you sure?</h2>
                  <p className={styles.panelCopy}>
                    {deleteActivityId
                      ? `"${activityItems.find((a) => a.id === deleteActivityId)?.name ?? 'This activity'}" will be permanently deleted. This action cannot be undone.`
                      : 'This activity will be permanently deleted. This action cannot be undone.'}
                  </p>
                </div>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={closeDeleteModal}
                  aria-label="Close delete confirmation"
                >
                  Close
                </button>
              </div>

              <div className={styles.formActions}>
                <button className={styles.secondaryButton} type="button" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button
                  className={styles.confirmDeleteButton}
                  type="button"
                  onClick={() => void confirmDeleteActivity()}
                >
                  Delete
                </button>
              </div>
            </article>
          </Modal>

          <main className={styles.main}>
            <div className={styles.mainLayout}>
              <div className={styles.toolsSidebarDesktop}>
                <aside className={styles.toolsSidebar}>
                  <nav className={styles.toolsSidebarList} aria-label="Tools">
                    {TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          className={`${styles.toolsSidebarItem} ${
                            selectedTool === tool.id ? styles.toolsSidebarItemActive : ''
                          }`}
                          onClick={() => setSelectedTool(tool.id)}
                          aria-current={selectedTool === tool.id ? 'true' : undefined}
                        >
                          <Icon />
                          <span>{tool.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </aside>
              </div>

              <div className={styles.toolsContent}>
                <div className={styles.toolsMobileSelector}>
                  <button
                    type="button"
                    className={`${styles.toolsMobileTrigger} ${
                      isToolsMenuExpanded ? styles.toolsMobileTriggerExpanded : ''
                    }`}
                    onClick={() => setIsToolsMenuExpanded((prev) => !prev)}
                    aria-expanded={isToolsMenuExpanded}
                    aria-haspopup="listbox"
                    aria-label="Select tool"
                  >
                    {(() => {
                      const tool = TOOLS.find((t) => t.id === selectedTool);
                      const Icon = tool?.icon ?? BsClock;
                      return (
                        <>
                          <Icon />
                          <span>{tool?.label ?? 'Pomodoro'}</span>
                          <BsChevronDown className={styles.toolsMobileChevron} />
                        </>
                      );
                    })()}
                  </button>
                  {isToolsMenuExpanded && (
                    <div className={styles.toolsMobileList} role="listbox">
                      {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            role="option"
                            aria-selected={selectedTool === tool.id}
                            className={`${styles.toolsMobileItem} ${
                              selectedTool === tool.id ? styles.toolsSidebarItemActive : ''
                            }`}
                            onClick={() => {
                              setSelectedTool(tool.id);
                              setIsToolsMenuExpanded(false);
                            }}
                          >
                            <Icon />
                            <span>{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedTool === 'pomodoro' && (
                  <>
                    {!authUser && (
                      <Reveal animateIn="animate__fadeInUp">
                        <section className={styles.hero}>
                          <div className={styles.heroActions}>
                            <button
                              className={styles.authButton}
                              type="button"
                              onClick={() => void handleSignIn()}
                              disabled={isSigningIn || isAuthLoading}
                            >
                              {isSigningIn ? 'Opening Google...' : 'Sign in with Google'}
                            </button>
                          </div>
                        </section>
                      </Reveal>
                    )}

                    <section className={styles.grid}>
                      <Reveal delay={220} animateIn="animate__fadeInUp">
                <article className={styles.timerPanel}>
                  <div className={styles.timerHeader}>
                    <div>
                      <p className={styles.eyebrow}>Timer</p>
                      <h2>Pomodoro timer</h2>
                      <p className={styles.panelCopy}>
                        Focus {formatMinutesLabel(config.focusMinutes)}, short break{' '}
                        {formatMinutesLabel(config.shortBreakMinutes)}, long break{' '}
                        {formatMinutesLabel(config.longBreakMinutes)}, every {config.cyclesUntilLongBreak}{' '}
                        focus cycles.
                      </p>
                    </div>
                    <div className={styles.timerHeaderActions}>
                      <button className={styles.secondaryButton} type="button" onClick={openSetupModal}>
                        Edit setup
                      </button>
                    </div>
                  </div>

                  <div className={styles.controlRow}>
                    {(timerStatus === 'idle' || timerStatus === 'paused') && (
                      <button className={styles.primaryButton} type="button" onClick={openNewActivityModal}>
                        New
                      </button>
                    )}
                  </div>

                  {pageError ? <p className={styles.helperText}>{pageError}</p> : null}
                  {isActivitiesLoading ? (
                    <p className={styles.helperText}>Loading saved pomodoros...</p>
                  ) : null}

                  <div className={styles.historyList}>
                    <div className={styles.panelHeader}>
                      <div>
                        <p className={styles.eyebrow}>Activity list</p>
                        <h3>Started activities</h3>
                      </div>
                    </div>

                    {activityItems.length === 0 ? (
                      <p className={styles.emptyState}>
                        Your activity will be added here as soon as you press Start.
                      </p>
                    ) : (
                      activityItems.map((activityItem) => {
                        const isSelectableWhenPaused =
                          timerStatus === 'paused' &&
                          activityItem.status !== 'completed' &&
                          activityItem.id !== activeActivityId;

                        return (
                          <article
                            key={activityItem.id}
                            className={`${styles.listCard} ${
                              activityItem.id === activeActivityId ? styles.listItemActive : ''
                            } ${isSelectableWhenPaused ? styles.listCardClickable : ''}`}
                            onClick={(e) => {
                              if (!isSelectableWhenPaused) return;
                              if ((e.target as HTMLElement).closest('button')) return;
                              void handleSelectPausedActivity(activityItem.id);
                            }}
                            onKeyDown={(e) => {
                              if (!isSelectableWhenPaused) return;
                              if ((e.target as HTMLElement).closest('button')) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                void handleSelectPausedActivity(activityItem.id);
                              }
                            }}
                            role={isSelectableWhenPaused ? 'button' : undefined}
                            tabIndex={isSelectableWhenPaused ? 0 : undefined}
                          >
                          <div className={styles.listHeading}>
                            <div>
                              <h4>{activityItem.name}</h4>
                              <p>{formatDateTime(activityItem.startedAt)}</p>
                            </div>
                            <div className={styles.listHeadingActions}>
                              <span className={getStatusPillClassName(activityItem.status)}>
                                {getStatusLabel(activityItem.status)}
                              </span>

                              {activityItem.id === activeActivityId ? (
                                activityItem.status === 'active' ? (
                                  <>
                                    <button
                                      className={styles.markCompleteButton}
                                      type="button"
                                      onClick={() => void handleMarkAsCompleted(activityItem.id)}
                                      aria-label="Mark as completed"
                                    >
                                      <BsCheckLg />
                                    </button>
                                    <button
                                      className={styles.inlineSecondaryAction}
                                      type="button"
                                      onClick={() => void handleResetTimer()}
                                    >
                                      Reset
                                    </button>
                                    <button
                                      className={styles.deleteIconButton}
                                      type="button"
                                      onClick={() => openDeleteModal(activityItem.id)}
                                      aria-label="Delete activity"
                                    >
                                      <BsTrashFill />
                                    </button>
                                  </>
                                ) : activityItem.status === 'incomplete' ? (
                                  <>
                                    <button
                                      className={styles.inlineAction}
                                      type="button"
                                      onClick={() => void handleResumeIncompleteActivity(activityItem.id)}
                                    >
                                      Resume
                                    </button>
                                    <button
                                      className={styles.markCompleteButton}
                                      type="button"
                                      onClick={() => void handleMarkAsCompleted(activityItem.id)}
                                      aria-label="Mark as completed"
                                    >
                                      <BsCheckLg />
                                    </button>
                                    <button
                                      className={styles.deleteIconButton}
                                      type="button"
                                      onClick={() => openDeleteModal(activityItem.id)}
                                      aria-label="Delete activity"
                                    >
                                      <BsTrashFill />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className={styles.deleteIconButton}
                                    type="button"
                                    onClick={() => openDeleteModal(activityItem.id)}
                                    aria-label="Delete activity"
                                  >
                                    <BsTrashFill />
                                  </button>
                                )
                              ) : activityItem.status === 'completed' ? (
                                <button
                                  className={styles.deleteIconButton}
                                  type="button"
                                  onClick={() => openDeleteModal(activityItem.id)}
                                  aria-label="Delete activity"
                                >
                                  <BsTrashFill />
                                </button>
                              ) : (
                                <>
                                  <button
                                    className={styles.markCompleteButton}
                                    type="button"
                                    onClick={() => void handleMarkAsCompleted(activityItem.id)}
                                    aria-label="Mark as completed"
                                  >
                                    <BsCheckLg />
                                  </button>
                                  <button
                                    className={styles.deleteIconButton}
                                    type="button"
                                    onClick={() => openDeleteModal(activityItem.id)}
                                    aria-label="Delete activity"
                                  >
                                    <BsTrashFill />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {activityItem.id === activeActivityId && (
                            <div className={styles.activeTimerBlock}>
                              <p className={styles.activeTimerLabel}>Live timer</p>
                              <p className={styles.timerDisplay}>{formatTimerDuration(remainingSeconds)}</p>

                              {activityItem.status === 'active' && (
                                <div className={styles.timerControls}>
                                  <button
                                    className={`${styles.timerControlBtn} ${styles.timerControlBtnSecondary}`}
                                    type="button"
                                    onClick={() => void handleSkipCycle()}
                                    aria-label="Skip to next phase"
                                  >
                                    <BsSkipForwardFill />
                                  </button>
                                  <button
                                    className={`${styles.timerControlBtn} ${styles.timerControlBtnPrimary}`}
                                    type="button"
                                    onClick={
                                      timerStatus === 'paused'
                                        ? () => void handleResumeTimer()
                                        : () => void handlePauseTimer()
                                    }
                                    aria-label={timerStatus === 'paused' ? 'Resume timer' : 'Pause timer'}
                                  >
                                    {timerStatus === 'paused' ? (
                                      <BsPlayFill />
                                    ) : (
                                      <BsPauseFill />
                                    )}
                                  </button>
                                </div>
                              )}

                              <div className={styles.timerMeta}>
                                <article className={styles.statCard}>
                                  <span>Timer status</span>
                                  <strong>{timerStatus === 'idle' ? 'Ready' : timerStatus}</strong>
                                </article>
                                <article className={styles.statCard}>
                                  <span>Current phase</span>
                                  <strong>{getPhaseLabel(activePhase)}</strong>
                                </article>
                                <article className={styles.statCard}>
                                  <span>Current cycle</span>
                                  <strong>
                                    {currentCycleNumber} of {config.cyclesUntilLongBreak}
                                  </strong>
                                </article>
                              </div>
                            </div>
                          )}
                        </article>
                        );
                      })
                    )}
                  </div>

                  <div className={styles.historyList}>
                    <div className={styles.panelHeader}>
                      <div>
                        <p className={styles.eyebrow}>Recent local cycles</p>
                        <h3>Current browser session</h3>
                      </div>
                    </div>

                    {localHistory.length === 0 ? (
                      <p className={styles.emptyState}>
                        Completed phases appear here right away, even before you sign in.
                      </p>
                    ) : (
                      localHistory.map((historyEntry) => (
                        <article key={historyEntry.id} className={styles.listCard}>
                          <div className={styles.listHeading}>
                            <div>
                              <h4>{getPhaseLabel(historyEntry.phaseType)}</h4>
                              <p>{formatTimerDuration(historyEntry.durationSeconds)}</p>
                            </div>
                            <span className={getPhasePillClassName(historyEntry.phaseType)}>
                              {getPhaseLabel(historyEntry.phaseType)}
                            </span>
                          </div>
                          <div className={styles.historyMeta}>
                            <span>Cycle {Math.max(1, historyEntry.cycleIndex)}</span>
                            <span>{formatDateTime(historyEntry.completedAt)}</span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </article>
                      </Reveal>
                    </section>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default ToolsPage;
