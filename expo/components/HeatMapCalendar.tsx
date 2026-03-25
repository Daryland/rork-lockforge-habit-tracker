import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface HeatMapCalendarProps {
  completions: string[];
  color: string;
  weeks?: number;
}

export default function HeatMapCalendar({ completions, color, weeks = 14 }: HeatMapCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completionSet = new Set(completions);

  const days: { date: Date; level: number }[] = [];
  const totalDays = weeks * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const str = d.toISOString().split('T')[0];
    const done = completionSet.has(str) ? 1 : 0;
    days.push({ date: d, level: done });
  }

  const columns: { date: Date; level: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(days.slice(w * 7, w * 7 + 7));
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={styles.container}>
      <View style={styles.dayLabelCol}>
        {dayLabels.map((d, i) => (
          <Text key={i} style={styles.dayLabel}>{i % 2 === 1 ? d : ''}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {columns.map((col, ci) => (
          <View key={ci} style={styles.column}>
            {col.map((cell, ri) => {
              const isToday = cell.date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
              return (
                <View
                  key={ri}
                  style={[
                    styles.cell,
                    cell.level === 1
                      ? { backgroundColor: color }
                      : { backgroundColor: Colors.bgCardAlt },
                    isToday && styles.todayCell,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  dayLabelCol: {
    gap: 3,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  dayLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    width: 10,
    height: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: 3,
    flex: 1,
  },
  column: {
    gap: 3,
    flex: 1,
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 3,
    flex: 1,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: Colors.orange,
  },
});
