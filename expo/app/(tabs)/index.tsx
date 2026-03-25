import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Lock, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import HabitCard from '@/components/HabitCard';
import ProgressRing from '@/components/ProgressRing';
import ProBanner from '@/components/ProBanner';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function TodayScreen() {
  const router = useRouter();
  const { todayHabits, todayCompleted, todayTotal, overallStreak, isPro, startSession, completeHabit, isTodayComplete } = useHabits();
  const fabScale = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [headerAnim]);

  const progress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

  const handleFabPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 30 }),
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    router.push('/habit-creator');
  };

  const handleStart = (habitId: string) => {
    startSession(habitId);
    router.push('/lock-screen');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.date}>{formatDay()}</Text>
          </View>
          <Pressable style={styles.bellBtn}>
            <Bell size={20} color={Colors.textSub} />
          </Pressable>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Progress Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <ProgressRing
                progress={progress}
                size={110}
                strokeWidth={10}
                color={Colors.orange}
                bgColor="rgba(30,58,138,0.4)"
              >
                <View style={styles.ringInner}>
                  <Text style={styles.ringPercent}>{Math.round(progress)}%</Text>
                  <Text style={styles.ringLabel}>done</Text>
                </View>
              </ProgressRing>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroTitle}>Today's Progress</Text>
              <Text style={styles.heroSub}>{todayCompleted} of {todayTotal} habits complete</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{overallStreak}</Text>
                  <Text style={styles.statLbl}>🔥 Best Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNum}>{todayTotal}</Text>
                  <Text style={styles.statLbl}>📅 Today</Text>
                </View>
              </View>
              {todayCompleted === todayTotal && todayTotal > 0 && (
                <View style={styles.allDoneBadge}>
                  <Text style={styles.allDoneText}>🏆 All done!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Lock status bar */}
          <View style={styles.lockBar}>
            <Lock size={13} color={Colors.orange} />
            <Text style={styles.lockBarText}>
              {todayHabits.reduce((sum, h) => sum + h.blockedApps.length, 0)} apps ready to be locked
            </Text>
          </View>

          {/* Pro banner */}
          {!isPro && (
            <ProBanner
              onUpgrade={() => router.push('/paywall')}
              onDismiss={() => {}}
            />
          )}

          {/* Today's habits */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <Text style={styles.sectionSub}>{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</Text>
          </View>

          {todayHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔒</Text>
              <Text style={styles.emptyTitle}>No habits scheduled</Text>
              <Text style={styles.emptySub}>Tap + to forge your first habit</Text>
              <Pressable style={styles.emptyBtn} onPress={() => router.push('/habit-creator')}>
                <Text style={styles.emptyBtnText}>Create a Habit</Text>
              </Pressable>
            </View>
          ) : (
            todayHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isTodayComplete(habit)}
                onStart={() => handleStart(habit.id)}
                onComplete={() => completeHabit(habit.id)}
                onPress={() => {}}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* FAB */}
        <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
          <Pressable style={styles.fabInner} onPress={handleFabPress}>
            <Plus size={26} color="#fff" strokeWidth={2.5} />
          </Pressable>
        </Animated.View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  date: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  heroLeft: {},
  ringInner: {
    alignItems: 'center',
  },
  ringPercent: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  ringLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  heroRight: {
    flex: 1,
    gap: 8,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroSub: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  statItem: {
    gap: 1,
  },
  statNum: {
    color: Colors.orange,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLbl: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  allDoneBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  allDoneText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  lockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.orangeGlow,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
  },
  lockBarText: {
    color: Colors.orange,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionSub: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySub: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyBtn: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
