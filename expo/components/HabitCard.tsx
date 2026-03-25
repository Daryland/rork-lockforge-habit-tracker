import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Lock, CheckCircle, Play, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Habit } from '@/hooks/useHabits';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onStart: () => void;
  onComplete: () => void;
  onPress: () => void;
}

export default function HabitCard({ habit, isCompleted, onStart, onComplete, onPress }: HabitCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();
    onStart();
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.borderGlow],
  });

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayDay = new Date().getDay();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.card, { borderColor }]}>
          <View style={styles.topRow}>
            <View style={[styles.emojiWrap, { backgroundColor: habit.color + '22' }]}>
              <Text style={styles.emoji}>{habit.emoji}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{habit.name}</Text>
              <Text style={styles.time}>
                {habit.startTime} – {habit.endTime} · {habit.duration}min
              </Text>
            </View>
            <View style={styles.rightSide}>
              {isCompleted ? (
                <View style={styles.doneChip}>
                  <CheckCircle size={14} color={Colors.success} />
                  <Text style={styles.doneText}>Done</Text>
                </View>
              ) : habit.isActive ? (
                <View style={[styles.activeChip, { backgroundColor: habit.color + '22' }]}>
                  <Zap size={12} color={habit.color} />
                  <Text style={[styles.activeText, { color: habit.color }]}>Active</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.streakRow}>
            <View style={styles.streakBadge}>
              <Text style={styles.fireEmoji}>🔥</Text>
              <Text style={styles.streakNum}>{habit.streak}</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
            <View style={styles.daysRow}>
              {dayLabels.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.dayDot,
                    habit.days.includes(i) && { backgroundColor: habit.color + '44', borderColor: habit.color },
                    i === todayDay && habit.days.includes(i) && { backgroundColor: habit.color },
                  ]}
                >
                  <Text style={[styles.dayText, i === todayDay && habit.days.includes(i) && styles.dayTextActive]}>
                    {d}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {habit.blockedApps.length > 0 && (
            <View style={styles.lockRow}>
              <Lock size={11} color={Colors.textMuted} />
              <Text style={styles.lockText}>
                Blocks {habit.blockedApps.map(a => a.name).join(', ')}
              </Text>
            </View>
          )}

          {!isCompleted && (
            <View style={styles.actions}>
              <Pressable
                style={[styles.startBtn, { backgroundColor: habit.color }]}
                onPress={handleStart}
              >
                <Play size={14} color="#fff" fill="#fff" />
                <Text style={styles.startBtnText}>Start Session</Text>
              </Pressable>
              <Pressable style={styles.quickDone} onPress={handleComplete}>
                <CheckCircle size={16} color={Colors.textMuted} />
                <Text style={styles.quickDoneText}>Mark Done</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  time: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '500',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  doneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  doneText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fireEmoji: {
    fontSize: 13,
  },
  streakNum: {
    color: Colors.orange,
    fontSize: 14,
    fontWeight: '800',
  },
  streakLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: Colors.bgCardAlt,
  },
  dayText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lockText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgCardAlt,
  },
  quickDoneText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
