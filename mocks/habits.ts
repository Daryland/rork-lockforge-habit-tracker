import { Habit } from '@/hooks/useHabits';

const today = new Date();
const getDateStr = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Morning Gym',
    emoji: '🏋️',
    duration: 60,
    startTime: '06:00',
    endTime: '07:00',
    days: [1, 2, 3, 4, 5],
    blockedApps: [
      { id: '1', name: 'Instagram', bundleId: 'com.burbn.instagram', icon: '📸', category: 'Social' },
      { id: '2', name: 'TikTok', bundleId: 'com.zhiliaoapp.musically', icon: '🎵', category: 'Social' },
    ],
    healthTarget: { type: 'workout', value: 1 },
    color: '#F97316',
    createdAt: getDateStr(30),
    completions: [0,1,2,3,5,6,7,8,9,10,12,13,14,15,16,19,20,21,22,23].map(getDateStr),
    streak: 5,
    bestStreak: 12,
    isActive: false,
  },
  {
    id: 'habit-2',
    name: 'Deep Work',
    emoji: '💻',
    duration: 90,
    startTime: '09:00',
    endTime: '10:30',
    days: [1, 2, 3, 4, 5],
    blockedApps: [
      { id: '1', name: 'Instagram', bundleId: 'com.burbn.instagram', icon: '📸', category: 'Social' },
      { id: '3', name: 'Twitter / X', bundleId: 'com.atebits.Tweetie2', icon: '🐦', category: 'Social' },
      { id: '6', name: 'YouTube', bundleId: 'com.google.ios.youtube', icon: '▶️', category: 'Video' },
    ],
    color: '#3B82F6',
    createdAt: getDateStr(20),
    completions: [0,1,2,4,5,6,7,8,9,11,12,13].map(getDateStr),
    streak: 3,
    bestStreak: 8,
    isActive: false,
  },
  {
    id: 'habit-3',
    name: 'Evening Run',
    emoji: '🏃',
    duration: 30,
    startTime: '18:00',
    endTime: '18:30',
    days: [1, 3, 5, 6, 0],
    blockedApps: [],
    healthTarget: { type: 'steps', value: 5000 },
    color: '#22C55E',
    createdAt: getDateStr(15),
    completions: [0,2,3,4,6,7,9,10].map(getDateStr),
    streak: 2,
    bestStreak: 5,
    isActive: false,
  },
  {
    id: 'habit-4',
    name: 'Meditation',
    emoji: '🧘',
    duration: 10,
    startTime: '07:00',
    endTime: '07:10',
    days: [0, 1, 2, 3, 4, 5, 6],
    blockedApps: [
      { id: '1', name: 'Instagram', bundleId: 'com.burbn.instagram', icon: '📸', category: 'Social' },
    ],
    color: '#A855F7',
    createdAt: getDateStr(10),
    completions: [0,1,2,3,4,6,7,8].map(getDateStr),
    streak: 4,
    bestStreak: 7,
    isActive: false,
  },
];

export const AI_INSIGHTS = [
  "Your productivity peaks after morning gym sessions — keep the streak alive! 🔥",
  "You complete 3x more deep work on days you meditate first.",
  "Tuesday is your strongest day — 94% completion rate.",
  "Based on your sleep data, try shifting gym to 7AM for optimal performance.",
  "You've blocked Instagram 47 times this month. That's 4.7 hours reclaimed.",
];

export const MOOD_EMOJIS = ['😞', '😐', '🙂', '😊', '🤩'];
