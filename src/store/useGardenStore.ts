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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
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

  // Calculate streak logic helper
  const updateStreakAndMetrics = (plants: PlantRecord[]) => {
    const completedPlants = plants.filter((p) => p.completed);
    if (completedPlants.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalFocusedMinutes: 0, totalWilts: plants.length };
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
      longestStreak: Math.max(state.longestStreak, currentStreak),
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
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
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

  // Cancel / Give Up / Wilt session
  const cancelSession = useCallback((reason: 'give_up' | 'tab_away' = 'give_up') => {
    if (!activeSession) return;

    if (state.settings.soundEffectsEnabled && soundEngine) {
      soundEngine.playWiltSound();
      soundEngine.stopAmbient();
    }

    const wiltedPlant: PlantRecord = {
      id: activeSession.id,
      plantedAt: activeSession.startTime,
      durationMinutes: Math.round(activeSession.targetSeconds / 60),
      actualFocusedSeconds: activeSession.elapsedSeconds,
      completed: false,
      species: activeSession.species,
      categoryTag: activeSession.categoryTag,
      intention: activeSession.intention,
      colorSeed: generatePlantColorSeed(activeSession.species, activeSession.timeOfDay),
      timeOfDay: activeSession.timeOfDay,
      journalNote: `Wilted due to ${reason === 'give_up' ? 'giving up early' : 'tab switch timeout'}.`,
    };

    setState((prev) => {
      const updatedPlants = [wiltedPlant, ...prev.plants];
      const metrics = updateStreakAndMetrics(updatedPlants);
      return {
        ...prev,
        plants: updatedPlants,
        ...metrics,
      };
    });

    setActiveSession(null);
  }, [activeSession, state.settings]);

  // Complete / Bloom session
  const completeSession = useCallback((journalNote?: string) => {
    if (!activeSession) return;

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
      id: activeSession.id,
      plantedAt: activeSession.startTime,
      durationMinutes: Math.round(activeSession.targetSeconds / 60),
      actualFocusedSeconds: activeSession.targetSeconds,
      completed: true,
      species: activeSession.species,
      categoryTag: activeSession.categoryTag,
      intention: activeSession.intention,
      colorSeed: generatePlantColorSeed(activeSession.species, activeSession.timeOfDay),
      timeOfDay: activeSession.timeOfDay,
      journalNote: journalNote || 'Fulfill focus session with clarity.',
    };

    const todayStr = new Date().toISOString().split('T')[0];

    setState((prev) => {
      const updatedPlants = [bloomedPlant, ...prev.plants];
      const metrics = updateStreakAndMetrics(updatedPlants);
      return {
        ...prev,
        plants: updatedPlants,
        lastCompletedDate: todayStr,
        ...metrics,
      };
    });

    setActiveSession(null);
  }, [activeSession, state.settings]);

  // Main timer tick loop
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
            cancelSession('tab_away');
            return null;
          }
          return { ...prev, graceTimeRemaining: nextGrace };
        }

        const nextElapsed = prev.elapsedSeconds + 1;
        if (nextElapsed >= prev.targetSeconds) {
          completeSession();
          return null;
        }
        return { ...prev, elapsedSeconds: nextElapsed };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, cancelSession, completeSession]);

  // Tab visibility detection
  useEffect(() => {
    if (!activeSession) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (activeSession.strictness === 'strict') {
          cancelSession('tab_away');
        } else if (activeSession.strictness === 'gentle') {
          setActiveSession((prev) => prev ? { ...prev, isGraceActive: true } : null);
        }
      } else {
        // Returned to tab
        if (activeSession.strictness === 'gentle') {
          setActiveSession((prev) => prev ? { ...prev, isGraceActive: false, graceTimeRemaining: state.settings.gracePeriodSeconds } : null);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeSession, cancelSession, state.settings.gracePeriodSeconds]);

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
      const metrics = updateStreakAndMetrics(updatedPlants);
      return { ...prev, plants: updatedPlants, ...metrics };
    });
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear your garden history and statistics? This cannot be undone.')) {
      setState(INITIAL_STATE);
      localStorage.removeItem(STORAGE_KEY);
    }
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
  };
}
