'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlantRecord, GardenSettings, GardenState, PlantSpecies, FocusCategory, StrictnessLevel, TimeOfDay } from '@/types/garden';
import { generatePlantColorSeed, getTimeOfDay } from '@/utils/colorGenerator';
import { soundEngine } from '@/utils/soundEngine';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'focus-garden-data-v1';

const DEFAULT_SETTINGS: GardenSettings = {
  defaultDuration: 25,
  strictness: 'gentle',
  gracePeriodSeconds: 15,
  selectedSpecies: 'wildflower',
  ambientSound: null,
  ambientVolume: 0.5,
  soundEffectsEnabled: true,
  themeMode: 'auto',
};

const INITIAL_STATE: GardenState = {
  version: '1.0',
  plants: [],
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  totalFocusedMinutes: 0,
  totalWilts: 0,
  settings: DEFAULT_SETTINGS,
};

// Validates a single plant record's shape before it's allowed into state, so a
// corrupted/hand-edited/outdated record can't reach components like PlantSVG that
// assume every field (e.g. colorSeed) is present and crash the whole garden view.
function isValidPlantRecord(p: unknown): p is PlantRecord {
  if (!p || typeof p !== 'object') return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.plantedAt === 'string' &&
    typeof r.durationMinutes === 'number' &&
    typeof r.actualFocusedSeconds === 'number' &&
    typeof r.completed === 'boolean' &&
    typeof r.species === 'string' &&
    typeof r.categoryTag === 'string' &&
    typeof r.intention === 'string' &&
    typeof r.colorSeed === 'object' && r.colorSeed !== null &&
    typeof r.timeOfDay === 'string'
  );
}

// Validates the full persisted/imported shape, including the version tag, so data
// from an incompatible schema is rejected instead of silently corrupting the app.
function isValidGardenState(parsed: unknown): parsed is GardenState {
  if (!parsed || typeof parsed !== 'object') return false;
  const s = parsed as Record<string, unknown>;
  return (
    s.version === INITIAL_STATE.version &&
    Array.isArray(s.plants) &&
    s.plants.every(isValidPlantRecord) &&
    typeof s.settings === 'object' && s.settings !== null
  );
}

// Kept as a plain top-level helper (not inline in the hook body) so the impure
// Math.random() fallback isn't flagged as a render-purity violation.
function generateSessionId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
}

export interface ActiveSession {
  id: string;
  startTime: string;
  targetSeconds: number;
  elapsedSeconds: number;
  isPaused: boolean;
  intention: string;
  categoryTag: FocusCategory;
  species: PlantSpecies;
  strictness: StrictnessLevel;
  timeOfDay: TimeOfDay;
  isGraceActive: boolean;
  graceTimeRemaining: number;
}

export function useGardenStore() {
  const [state, setState] = useState<GardenState>(INITIAL_STATE);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Always holds the latest activeSession, so cancelSession/completeSession can read
  // fresh data without needing activeSession itself in their useCallback deps (which
  // would otherwise recreate them — and the interval that depends on them — every tick).
  // Synced via effect rather than during render: refs must not be written mid-render.
  const activeSessionRef = useRef<ActiveSession | null>(null);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // Load from localStorage on mount. This must stay an effect (not a lazy useState
  // initializer) because localStorage is only readable client-side; reading it during
  // render would desync the server-rendered HTML from the client's first paint.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidGardenState(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setState({ ...INITIAL_STATE, ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } });
        } else {
          console.warn('Ignoring stored garden data with an unrecognized shape/version; starting fresh.');
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [state, isLoaded]);

  // Keep the sound engine's live volume in sync with the persisted setting — previously
  // ambientVolume was stored but never actually applied anywhere.
  useEffect(() => {
    if (!isLoaded || !soundEngine) return;
    soundEngine.setVolume(state.settings.ambientVolume);
  }, [state.settings.ambientVolume, isLoaded]);

  // Apply the resolved light/dark theme to <html>, tracking the OS preference while in 'auto'
  useEffect(() => {
    if (!isLoaded) return;
    const root = document.documentElement;
    const mode = state.settings.themeMode;

    const applyResolvedTheme = (mql: MediaQueryList) => {
      const isDark = mode === 'dark' || (mode === 'auto' && mql.matches);
      root.classList.toggle('dark', isDark);
    };

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    applyResolvedTheme(mql);

    if (mode === 'auto') {
      const handleChange = () => applyResolvedTheme(mql);
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }
  }, [state.settings.themeMode, isLoaded]);

  // Calculate streak logic helper. Takes the previous state explicitly (rather than
  // closing over the outer `state`) so it always reflects the value setState is
  // actually transitioning from, not whatever was current at the last render.
  const updateStreakAndMetrics = (plants: PlantRecord[], prevState: GardenState) => {
    const completedPlants = plants.filter((p) => p.completed);
    if (completedPlants.length === 0) {
      return { currentStreak: 0, longestStreak: prevState.longestStreak, totalFocusedMinutes: 0, totalWilts: plants.length };
    }

    // Get unique YYYY-MM-DD completion dates sorted descending
    const dates = Array.from(
      new Set(
        completedPlants.map((p) => new Date(p.plantedAt).toISOString().split('T')[0])
      )
    ).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    let currentStreak = 0;
    // Streak continues if active today or yesterday
    if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
      let checkDate = new Date();
      if (!dates.includes(todayStr) && dates.includes(yesterdayStr)) {
        checkDate = yesterdayDate;
      }
      while (true) {
        const str = checkDate.toISOString().split('T')[0];
        if (dates.includes(str)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const totalFocusedMinutes = Math.round(
      completedPlants.reduce((acc, p) => acc + p.actualFocusedSeconds, 0) / 60
    );

    const totalWilts = plants.filter((p) => !p.completed).length;

    return {
      currentStreak,
      longestStreak: Math.max(prevState.longestStreak, currentStreak),
      totalFocusedMinutes,
      totalWilts,
    };
  };

  // Start new focus session
  const startSession = (
    durationMinutes: number,
    intention: string = '',
    categoryTag: FocusCategory = 'coding',
    species: PlantSpecies = state.settings.selectedSpecies
  ) => {
    const timeOfDay = getTimeOfDay();
    const newSession: ActiveSession = {
      id: generateSessionId(),
      startTime: new Date().toISOString(),
      targetSeconds: durationMinutes * 60,
      elapsedSeconds: 0,
      isPaused: false,
      intention: intention.trim() || `Focus on ${categoryTag}`,
      categoryTag,
      species,
      strictness: state.settings.strictness,
      timeOfDay,
      isGraceActive: false,
      graceTimeRemaining: state.settings.gracePeriodSeconds,
    };

    setActiveSession(newSession);

    // Remember this duration/species as the new default for next time
    updateSettings({ defaultDuration: durationMinutes, selectedSpecies: species });

    // Start ambient sound if selected
    if (state.settings.ambientSound && soundEngine) {
      soundEngine.startAmbient(state.settings.ambientSound as 'rain' | 'forest' | 'waves' | 'lofi');
    }
  };

  const pauseSession = () => {
    if (!activeSession) return;
    setActiveSession((prev) => prev ? { ...prev, isPaused: true } : null);
    if (soundEngine) soundEngine.playClickSound();
  };

  const resumeSession = () => {
    if (!activeSession) return;
    setActiveSession((prev) => prev ? { ...prev, isPaused: false } : null);
    if (soundEngine) soundEngine.playClickSound();
  };

  // Cancel / Give Up / Wilt session. Accepts an optional explicit session snapshot for
  // callers inside a setActiveSession updater (where `prev` is fresher than the ref);
  // everyone else (button clicks, the visibility handler) falls back to the ref.
  const cancelSession = useCallback((reason: 'give_up' | 'tab_away' = 'give_up', sessionOverride?: ActiveSession) => {
    const session = sessionOverride ?? activeSessionRef.current;
    if (!session) return;

    if (state.settings.soundEffectsEnabled && soundEngine) {
      soundEngine.playWiltSound();
      soundEngine.stopAmbient();
    }

    const wiltedPlant: PlantRecord = {
      id: session.id,
      plantedAt: session.startTime,
      durationMinutes: Math.round(session.targetSeconds / 60),
      actualFocusedSeconds: session.elapsedSeconds,
      completed: false,
      species: session.species,
      categoryTag: session.categoryTag,
      intention: session.intention,
      colorSeed: generatePlantColorSeed(session.species),
      timeOfDay: session.timeOfDay,
      journalNote: `Wilted due to ${reason === 'give_up' ? 'giving up early' : 'tab switch timeout'}.`,
    };

    setState((prev) => {
      const updatedPlants = [wiltedPlant, ...prev.plants];
      const metrics = updateStreakAndMetrics(updatedPlants, prev);
      return {
        ...prev,
        plants: updatedPlants,
        ...metrics,
      };
    });

    setActiveSession(null);
  }, [state.settings]);

  // Complete / Bloom session. Same sessionOverride pattern as cancelSession above.
  const completeSession = useCallback((journalNote?: string, sessionOverride?: ActiveSession) => {
    const session = sessionOverride ?? activeSessionRef.current;
    if (!session) return;

    // Trigger celebration effects
    if (state.settings.soundEffectsEnabled && soundEngine) {
      soundEngine.playBloomChime();
      soundEngine.stopAmbient();
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#34d399', '#f43f5e', '#fbbf24', '#a855f7', '#38bdf8']
      });
    } catch {}

    const bloomedPlant: PlantRecord = {
      id: session.id,
      plantedAt: session.startTime,
      durationMinutes: Math.round(session.targetSeconds / 60),
      actualFocusedSeconds: session.targetSeconds,
      completed: true,
      species: session.species,
      categoryTag: session.categoryTag,
      intention: session.intention,
      colorSeed: generatePlantColorSeed(session.species),
      timeOfDay: session.timeOfDay,
      journalNote: journalNote || 'Fulfill focus session with clarity.',
    };

    const todayStr = new Date().toISOString().split('T')[0];

    setState((prev) => {
      const updatedPlants = [bloomedPlant, ...prev.plants];
      const metrics = updateStreakAndMetrics(updatedPlants, prev);
      return {
        ...prev,
        plants: updatedPlants,
        lastCompletedDate: todayStr,
        ...metrics,
      };
    });

    setActiveSession(null);
  }, [state.settings]);

  // Main timer tick loop. Depends only on session identity/pause-state (primitives),
  // not the whole activeSession object — that object gets a new reference every single
  // tick (see the setActiveSession call below), which previously tore down and rebuilt
  // this interval every second instead of running one persistent interval per session.
  useEffect(() => {
    if (!activeSession || activeSession.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev || prev.isPaused) return prev;

        // If tab is in grace countdown mode
        if (prev.isGraceActive) {
          const nextGrace = prev.graceTimeRemaining - 1;
          if (nextGrace <= 0) {
            cancelSession('tab_away', prev);
            return null;
          }
          return { ...prev, graceTimeRemaining: nextGrace };
        }

        const nextElapsed = prev.elapsedSeconds + 1;
        if (nextElapsed >= prev.targetSeconds) {
          completeSession(undefined, prev);
          return null;
        }
        return { ...prev, elapsedSeconds: nextElapsed };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.id, activeSession?.isPaused, cancelSession, completeSession]);

  // Tab visibility detection. Same fix as above: depends on session id/strictness
  // (stable for a session's whole lifetime) instead of the whole activeSession object.
  useEffect(() => {
    if (!activeSession) return;
    const strictness = activeSession.strictness;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (strictness === 'strict') {
          cancelSession('tab_away');
        } else if (strictness === 'gentle') {
          setActiveSession((prev) => prev ? { ...prev, isGraceActive: true } : null);
        }
      } else {
        // Returned to tab
        if (strictness === 'gentle') {
          setActiveSession((prev) => prev ? { ...prev, isGraceActive: false, graceTimeRemaining: state.settings.gracePeriodSeconds } : null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession?.id, activeSession?.strictness, cancelSession, state.settings.gracePeriodSeconds]);

  // Settings updates
  const updateSettings = (partial: Partial<GardenSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  const updateJournalNote = (id: string, journalNote: string) => {
    setState((prev) => ({
      ...prev,
      plants: prev.plants.map((p) => (p.id === id ? { ...p, journalNote } : p)),
    }));
  };

  const deletePlant = (id: string) => {
    setState((prev) => {
      const updatedPlants = prev.plants.filter((p) => p.id !== id);
      const metrics = updateStreakAndMetrics(updatedPlants, prev);
      return { ...prev, plants: updatedPlants, ...metrics };
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear your garden history and statistics? This cannot be undone.')) {
      setState(INITIAL_STATE);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Export the full garden state as a downloadable JSON backup file
  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-garden-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Import garden state from a previously exported JSON backup file
  const importData = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (isValidGardenState(parsed)) {
            setState({ ...INITIAL_STATE, ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } });
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  return {
    state,
    activeSession,
    isLoaded,
    startSession,
    pauseSession,
    resumeSession,
    cancelSession,
    completeSession,
    updateSettings,
    updateJournalNote,
    deletePlant,
    clearAllData,
    exportData,
    importData,
  };
}
