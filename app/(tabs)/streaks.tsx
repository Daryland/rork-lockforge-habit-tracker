import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Trophy, Target, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import HeatMapCalendar from '@/components/HeatMapCalendar';

export default function StreaksScreen() {
  const { habits } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string>(habits[0]?.id ?? '');

  const selectedHabit = habits.find(h => h.id === selectedHabitId) ?? habits[0];

  const totalCompletions = selectedHabit?.completions.length ?? 0;
  const completionRate = selectedHabit
    ? Math.round((totalCompletions / Math.max(1, Math.ceil((Date.now() - new Date(selectedHabit.createdAt).getTime()) / 86400000))) * 100)
    : 0;

  const allCompletions = habits.flatMap(h => h.completions);
  const uniqueDays = new Set(allCompletions).size;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Streaks</Text>
          <View style={styles.overallStreak}>
            <Flame size={16} color={Colors.orange} fill={Colors.orange} />
            <Text style={styles.overallStreakText}>
              {Math.max(...habits.map(h => h.streak), 0)} day streak
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Stat Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Flame size={20} color={Colors.orange} fill={Colors.orange} />
              <Text style={styles.statNum}>{Math.max(...habits.map(h => h.streak), 0)}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Trophy size={20} color="#EAB308" />
              <Text style={styles.statNum}>{Math.max(...habits.map(h => h.bestStreak), 0)}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color={Colors.navyLight} />
              <Text style={styles.statNum}>{uniqueDays}</Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color={Colors.success} />
              <Text style={styles.statNum}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>

          {/* Habit selector */}
          <Text style={styles.sectionTitle}>Habit Heat Map</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {habits.map(h => (
              <Pressable
                key={h.id}
                style={[
                  styles.pill,
                  selectedHabitId === h.id && { backgroundColor: h.color + '33', borderColor: h.color },
                ]}
                onPress={() => setSelectedHabitId(h.id)}
              >
                <Text style={styles.pillEmoji}>{h.emoji}</Text>
                <Text style={[styles.pillText, selectedHabitId === h.id && { color: h.color }]}>
                  {h.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Heat map */}
          {selectedHabit && (
            <View style={styles.heatCard}>
              <View style={styles.heatHeader}>
                <Text style={styles.heatEmoji}>{selectedHabit.emoji}</Text>
                <View>
                  <Text style={styles.heatName}>{selectedHabit.name}</Text>
                  <Text style={styles.heatMeta}>
                    {totalCompletions} completions · {selectedHabit.streak} day streak
                  </Text>
                </View>
                <View style={[styles.streakBadge, { backgroundColor: selectedHabit.color + '22' }]}>
                  <Flame size={12} color={selectedHabit.color} />
                  <Text style={[styles.streakBadgeText, { color: selectedHabit.color }]}>
                    {selectedHabit.streak}
                  </Text>
                </View>
              </View>
              <HeatMapCalendar
                completions={selectedHabit.completions}
                color={selectedHabit.color}
                weeks={14}
              />
              <View style={styles.legend}>
                <Text style={styles.legendText}>Less</Text>
                {[0.2, 0.4, 0.7, 1].map((o, i) => (
                  <View key={i} style={[styles.legendDot, { backgroundColor: selectedHabit.color, opacity: o }]} />
                ))}
                <Text style={styles.legendText}>More</Text>
              </View>
            </View>
          )}

          {/* All habits summary */}
          <Text style={styles.sectionTitle}>All Habits</Text>
          {habits.map(h => {
            const rate = Math.round((h.completions.length / Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000))) * 100);
            return (
              <Pressable key={h.id} style={styles.habitRow} onPress={() => setSelectedHabitId(h.id)}>
                <View style={[styles.habitIcon, { backgroundColor: h.color + '22' }]}>
                  <Text style={styles.habitIconEmoji}>{h.emoji}</Text>
                </View>
                <View style={styles.habitRowInfo}>
                  <Text style={styles.habitRowName}>{h.name}</Text>
                  <View style={styles.barWrap}>
                    <View style={[styles.barFill, { width: `${rate}%` as any, backgroundColor: h.color }]} />
                  </View>
                </View>
                <View style={styles.habitRowRight}>
                  <Flame size={12} color={Colors.orange} />
                  <Text style={styles.habitRowStreak}>{h.streak}</Text>
                </View>
              </Pressable>
            );
          })}

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
  overallStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.orangeGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overallStreakText: {
    color: Colors.orange,
    fontSize: 13,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  statNum: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  pillScroll: {
    marginBottom: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillText: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '600',
  },
  heatCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 14,
    marginBottom: 24,
  },
  heatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heatEmoji: {
    fontSize: 22,
  },
  heatName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  heatMeta: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  streakBadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIconEmoji: {
    fontSize: 18,
  },
  habitRowInfo: {
    flex: 1,
    gap: 8,
  },
  habitRowName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  barWrap: {
    height: 4,
    backgroundColor: Colors.bgCardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  habitRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  habitRowStreak: {
    color: Colors.orange,
    fontSize: 15,
    fontWeight: '800',
  },
});
