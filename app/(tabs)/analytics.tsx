import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, TrendingUp, Lock, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import { AI_INSIGHTS, MOOD_EMOJIS } from '@/mocks/habits';

function WeeklyBarChart({ habits }: { habits: ReturnType<typeof useHabits>['habits'] }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();

  const weekData = days.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (today.getDay() - i + 7) % 7);
    const str = d.toISOString().split('T')[0];
    const completed = habits.filter(h => h.completions.includes(str)).length;
    const total = habits.filter(h => h.days.includes(i)).length;
    return { day: days[i], completed, total, pct: total > 0 ? completed / total : 0 };
  });

  const maxPct = Math.max(...weekData.map(d => d.pct), 0.01);

  return (
    <View style={barStyles.container}>
      {weekData.map((d, i) => {
        const isToday = i === today.getDay();
        const barH = Math.max(4, (d.pct / maxPct) * 90);
        return (
          <View key={i} style={barStyles.col}>
            <View style={barStyles.barWrap}>
              <View
                style={[
                  barStyles.bar,
                  { height: barH, backgroundColor: isToday ? Colors.orange : Colors.navyLight + '99' },
                ]}
              />
            </View>
            <Text style={[barStyles.label, isToday && { color: Colors.orange }]}>{d.day}</Text>
            <Text style={barStyles.num}>{d.completed}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
    paddingBottom: 0,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    borderRadius: 6,
    minHeight: 4,
  },
  label: {
    fontSize: 11,
    color: Colors.textSub,
    fontWeight: '700',
  },
  num: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

export default function AnalyticsScreen() {
  const { habits, isPro } = useHabits();
  const [insightIndex, setInsightIndex] = useState(0);

  const totalCompletions = habits.reduce((s, h) => s + h.completions.length, 0);
  const totalBlocks = habits.reduce((s, h) => s + h.blockedApps.length, 0);
  const avgStreak = habits.length > 0
    ? Math.round(habits.reduce((s, h) => s + h.streak, 0) / habits.length)
    : 0;

  const topHabit = habits.reduce((best, h) => h.streak > (best?.streak ?? -1) ? h : best, habits[0]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          {isPro && (
            <View style={styles.proBadge}>
              <Zap size={12} color={Colors.orange} />
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* KPI row */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNum}>{totalCompletions}</Text>
              <Text style={styles.kpiLabel}>Total Done</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNum}>{avgStreak}</Text>
              <Text style={styles.kpiLabel}>Avg Streak</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNum}>{totalBlocks}</Text>
              <Text style={styles.kpiLabel}>Apps Locked</Text>
            </View>
          </View>

          {/* Weekly chart */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={16} color={Colors.orange} />
              <Text style={styles.cardTitle}>This Week</Text>
            </View>
            <WeeklyBarChart habits={habits} />
          </View>

          {/* AI Insight */}
          <View style={[styles.card, styles.insightCard]}>
            <View style={styles.cardHeader}>
              <Brain size={16} color={Colors.navyLight} />
              <Text style={styles.cardTitle}>AI Insight</Text>
              {!isPro && <View style={styles.proTag}><Text style={styles.proTagText}>PRO</Text></View>}
            </View>
            {isPro ? (
              <>
                <Text style={styles.insightText}>{AI_INSIGHTS[insightIndex]}</Text>
                <Pressable
                  style={styles.nextInsight}
                  onPress={() => setInsightIndex((insightIndex + 1) % AI_INSIGHTS.length)}
                >
                  <Text style={styles.nextInsightText}>Next insight →</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.insightLocked}>
                <Text style={styles.insightLockedIcon}>🔒</Text>
                <Text style={styles.insightLockedTitle}>Coming Soon</Text>
                <Text style={styles.insightLockedSub}>AI-powered insights are part of LockForge Pro. In-app purchases launching soon.</Text>
              </View>
            )}
          </View>

          {/* Top habit */}
          {topHabit && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 16 }}>🏆</Text>
                <Text style={styles.cardTitle}>Top Performer</Text>
              </View>
              <View style={styles.topHabitRow}>
                <View style={[styles.topHabitIcon, { backgroundColor: topHabit.color + '22' }]}>
                  <Text style={{ fontSize: 24 }}>{topHabit.emoji}</Text>
                </View>
                <View style={styles.topHabitInfo}>
                  <Text style={styles.topHabitName}>{topHabit.name}</Text>
                  <Text style={styles.topHabitSub}>{topHabit.streak} day streak · {topHabit.completions.length} total</Text>
                  <View style={styles.topHabitBar}>
                    <View style={[styles.topHabitFill, { width: '100%', backgroundColor: topHabit.color }]} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Lock stats */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lock size={16} color={Colors.error} />
              <Text style={styles.cardTitle}>Lock Stats</Text>
            </View>
            {habits.filter(h => h.blockedApps.length > 0).map(h => (
              <View key={h.id} style={styles.lockStatRow}>
                <Text style={styles.lockStatEmoji}>{h.emoji}</Text>
                <View style={styles.lockStatInfo}>
                  <Text style={styles.lockStatName}>{h.name}</Text>
                  <Text style={styles.lockStatSub}>
                    Blocks {h.blockedApps.map(a => a.name).join(', ')}
                  </Text>
                </View>
                <View style={[styles.lockCount, { backgroundColor: h.color + '22' }]}>
                  <Text style={[styles.lockCountText, { color: h.color }]}>{h.blockedApps.length}</Text>
                </View>
              </View>
            ))}
            {habits.filter(h => h.blockedApps.length > 0).length === 0 && (
              <Text style={styles.emptyText}>No app locks configured</Text>
            )}
          </View>

          {/* Mood prompt */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 16 }}>😊</Text>
              <Text style={styles.cardTitle}>How are you feeling?</Text>
            </View>
            <View style={styles.moodRow}>
              {MOOD_EMOJIS.map((emoji, i) => (
                <Pressable key={i} style={styles.moodBtn}>
                  <Text style={styles.moodEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
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
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orangeGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: {
    color: Colors.orange,
    fontSize: 12,
    fontWeight: '800',
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  kpiNum: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  kpiLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.2,
  },
  insightCard: {
    borderColor: Colors.borderLight,
    backgroundColor: Colors.navyDark,
  },
  insightText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  nextInsight: {
    alignSelf: 'flex-start',
  },
  nextInsightText: {
    color: Colors.navyLight,
    fontSize: 13,
    fontWeight: '700',
  },
  insightLocked: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  insightLockedIcon: {
    fontSize: 28,
  },
  insightLockedTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  insightLockedSub: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  proTag: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  topHabitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  topHabitIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHabitInfo: {
    flex: 1,
    gap: 5,
  },
  topHabitName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  topHabitSub: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '500',
  },
  topHabitBar: {
    height: 5,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  topHabitFill: {
    height: '100%',
    borderRadius: 3,
  },
  lockStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  lockStatEmoji: {
    fontSize: 20,
  },
  lockStatInfo: {
    flex: 1,
    gap: 2,
  },
  lockStatName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  lockStatSub: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '500',
  },
  lockCount: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.bgCardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodEmoji: {
    fontSize: 26,
  },
});
