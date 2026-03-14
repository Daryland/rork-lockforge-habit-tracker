import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, CheckCircle, AlertTriangle, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import ProgressRing from '@/components/ProgressRing';

function formatTime(ms: number) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function LockScreen() {
  const router = useRouter();
  const { activeSession, habits, endSession, isPro } = useHabits();
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lockRotate = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const habit = habits.find(h => h.id === activeSession?.habitId);

  useEffect(() => {
    if (!activeSession) {
      router.replace('/(tabs)');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const rem = Math.max(0, activeSession.endsAt - now);
      const elap = now - activeSession.startedAt;
      setRemaining(rem);
      setElapsed(elap);
      if (rem <= 0) {
        clearInterval(interval);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 500);

    setRemaining(Math.max(0, activeSession.endsAt - Date.now()));
    setElapsed(Date.now() - activeSession.startedAt);

    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (activeSession) {
      await endSession(activeSession.habitId, true);
    }
    router.replace('/(tabs)');
  };

  const handleBreakLock = () => {
    if (!isPro) {
      Alert.alert(
        '🔒 Pro Feature — Coming Soon',
        'Emergency break lock is a LockForge Pro feature. In-app purchases are launching soon — stay locked in for now! 💪',
        [{ text: 'Stay Locked 💪', style: 'cancel' }]
      );
      return;
    }
    Alert.alert(
      '⚠️ Break Lock?',
      'Are you sure? This will end your session without completing the habit.',
      [
        { text: 'Stay Focused', style: 'cancel' },
        {
          text: 'Break Lock',
          style: 'destructive',
          onPress: async () => {
            if (activeSession) {
              await endSession(activeSession.habitId, false);
            }
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (!habit || !activeSession) return null;

  const totalDuration = activeSession.endsAt - activeSession.startedAt;
  const progress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;
  const isComplete = remaining <= 0;

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [habit.color + '40', habit.color + '80'],
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.lockBadge}>
            <Lock size={14} color={Colors.orange} />
            <Text style={styles.lockBadgeText}>SESSION ACTIVE</Text>
          </View>
          <View style={styles.blockedRow}>
            {habit.blockedApps.slice(0, 4).map(app => (
              <Text key={app.id} style={styles.blockedIcon}>{app.icon}</Text>
            ))}
            {habit.blockedApps.length > 4 && (
              <Text style={styles.blockedMore}>+{habit.blockedApps.length - 4}</Text>
            )}
            {habit.blockedApps.length > 0 && (
              <Text style={styles.blockedLabel}>blocked</Text>
            )}
          </View>
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Animated.View style={[styles.glowRing, { shadowColor: habit.color, borderColor: glowColor }]}>
              <ProgressRing
                progress={progress}
                size={220}
                strokeWidth={8}
                color={habit.color}
                bgColor="rgba(30,58,138,0.2)"
              >
                <View style={styles.ringContent}>
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  {isComplete ? (
                    <>
                      <Text style={styles.completeText}>Done!</Text>
                      <Text style={styles.completeSub}>Session complete</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                      <Text style={styles.timerLabel}>remaining</Text>
                    </>
                  )}
                </View>
              </ProgressRing>
            </Animated.View>
          </Animated.View>

          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitMeta}>
            {habit.startTime} – {habit.endTime} · {habit.duration}min
          </Text>

          {/* Streak */}
          <View style={[styles.streakBadge, { backgroundColor: habit.color + '22' }]}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: habit.color }]}>{habit.streak} day streak</Text>
          </View>
        </View>

        {/* Shield info */}
        <View style={styles.shieldRow}>
          <Shield size={14} color={Colors.navyLight} />
          <Text style={styles.shieldText}>
            {habit.blockedApps.length > 0
              ? `${habit.blockedApps.map(a => a.name).join(', ')} are blocked`
              : 'Stay focused. No apps blocked.'}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isComplete ? (
            <Pressable style={[styles.completeBtn, { backgroundColor: habit.color }]} onPress={handleComplete}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.completeBtnText}>Mark Complete 🎉</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={[styles.completeBtn, { backgroundColor: habit.color }]} onPress={handleComplete}>
                <CheckCircle size={18} color="#fff" />
                <Text style={styles.completeBtnText}>Complete Early</Text>
              </Pressable>
              <Pressable style={styles.breakBtn} onPress={handleBreakLock}>
                <AlertTriangle size={14} color={Colors.textMuted} />
                <Text style={styles.breakBtnText}>
                  Break Lock {!isPro ? '(Pro)' : ''}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Motivational quote */}
        <Text style={styles.quote}>"Discipline is choosing between what you want now and what you want most."</Text>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.orangeGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
  },
  lockBadgeText: {
    color: Colors.orange,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blockedIcon: {
    fontSize: 18,
  },
  blockedMore: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  blockedLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  glowRing: {
    borderRadius: 120,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
    padding: 4,
  },
  ringContent: {
    alignItems: 'center',
    gap: 2,
  },
  habitEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  timerText: {
    color: Colors.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  completeText: {
    color: Colors.success,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  completeSub: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '600',
  },
  habitName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  habitMeta: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '500',
    marginTop: -8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  shieldText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  actions: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 8,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  breakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  quote: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingBottom: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
