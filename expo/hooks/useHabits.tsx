import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_HABITS } from '@/mocks/habits';
import { BlockedApp } from '@/mocks/apps';

export interface HealthTarget {
  type: 'steps' | 'calories' | 'sleep' | 'workout';
  value: number;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  duration: number;
  startTime: string;
  endTime: string;
  days: number[];
  blockedApps: BlockedApp[];
  healthTarget?: HealthTarget;
  color: string;
  createdAt: string;
  completions: string[];
  streak: number;
  bestStreak: number;
  isActive: boolean;
}

export interface ActiveSession {
  habitId: string;
  startedAt: number;
  endsAt: number;
}

const STORAGE_KEY = 'lockforge_habits';
const PRO_KEY = 'lockforge_pro';
const ONBOARDING_KEY = 'lockforge_onboarded';

const todayStr = () => new Date().toISOString().split('T')[0];

function computeStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  const sorted = [...completions].sort().reverse();
  const today = todayStr();
  let streak = 0;
  let current = new Date(today);
  for (const c of sorted) {
    const d = current.toISOString().split('T')[0];
    if (c === d) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const [HabitsProvider, useHabits] = createContextHook(() => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const [stored, proVal, onboardedVal] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(PRO_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);
        if (stored) {
          setHabits(JSON.parse(stored));
        } else {
          setHabits(DEFAULT_HABITS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HABITS));
        }
        setIsPro(proVal === 'true');
        setOnboarded(onboardedVal === 'true');
      } catch (e) {
        console.error('[useHabits] load error', e);
        setHabits(DEFAULT_HABITS);
        setOnboarded(false);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const saveHabits = useCallback(async (updated: Habit[]) => {
    setHabits(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[useHabits] save error', e);
    }
  }, []);

  const addHabit = useCallback(async (habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'streak' | 'bestStreak' | 'isActive'>) => {
    const newHabit: Habit = {
      ...habit,
      id: `habit-${Date.now()}`,
      createdAt: todayStr(),
      completions: [],
      streak: 0,
      bestStreak: 0,
      isActive: false,
    };
    const updated = [...habits, newHabit];
    await saveHabits(updated);
    return newHabit;
  }, [habits, saveHabits]);

  const updateHabit = useCallback(async (id: string, changes: Partial<Habit>) => {
    const updated = habits.map(h => h.id === id ? { ...h, ...changes } : h);
    await saveHabits(updated);
  }, [habits, saveHabits]);

  const deleteHabit = useCallback(async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    await saveHabits(updated);
  }, [habits, saveHabits]);

  const completeHabit = useCallback(async (id: string) => {
    const today = todayStr();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const alreadyDone = h.completions.includes(today);
      if (alreadyDone) return h;
      const newCompletions = [...h.completions, today];
      const newStreak = computeStreak(newCompletions);
      return {
        ...h,
        completions: newCompletions,
        streak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak),
        isActive: false,
      };
    });
    await saveHabits(updated);
    setActiveSession(null);
  }, [habits, saveHabits]);

  const startSession = useCallback((habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const now = Date.now();
    const endsAt = now + habit.duration * 60 * 1000;
    setActiveSession({ habitId, startedAt: now, endsAt });
    const updated = habits.map(h => h.id === habitId ? { ...h, isActive: true } : h);
    saveHabits(updated);
    console.log('[useHabits] session started', habitId);
  }, [habits, saveHabits]);

  const endSession = useCallback(async (habitId: string, completed: boolean) => {
    if (completed) {
      await completeHabit(habitId);
    } else {
      const updated = habits.map(h => h.id === habitId ? { ...h, isActive: false } : h);
      await saveHabits(updated);
      setActiveSession(null);
    }
  }, [habits, saveHabits, completeHabit]);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const upgradeToPro = useCallback(async () => {
    setIsPro(true);
    await AsyncStorage.setItem(PRO_KEY, 'true');
  }, []);

  const isTodayComplete = useCallback((habit: Habit) => {
    return habit.completions.includes(todayStr());
  }, []);

  const todayHabits = habits.filter(h => {
    const day = new Date().getDay();
    return h.days.includes(day);
  });

  const todayCompleted = todayHabits.filter(isTodayComplete).length;
  const todayTotal = todayHabits.length;
  const overallStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

  return {
    habits,
    todayHabits,
    todayCompleted,
    todayTotal,
    overallStreak,
    activeSession,
    isPro,
    onboarded,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    startSession,
    endSession,
    completeOnboarding,
    upgradeToPro,
    isTodayComplete,
  };
});
