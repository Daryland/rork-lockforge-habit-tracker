import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, ChevronRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, HabitColors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import { BLOCKABLE_APPS, BlockedApp } from '@/mocks/apps';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EMOJIS = ['🏋️', '💻', '🧘', '🏃', '📚', '🎯', '💪', '🧠', '🎨', '🥗', '😴', '🚴', '🏊', '✍️', '🎸'];
const DURATIONS = [10, 15, 20, 30, 45, 60, 90, 120];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const STEPS = ['basics', 'schedule', 'locks', 'confirm'] as const;
type Step = typeof STEPS[number];

export default function HabitCreatorScreen() {
  const router = useRouter();
  const { addHabit, habits, isPro } = useHabits();

  const [step, setStep] = useState<Step>('basics');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏋️');
  const [color, setColor] = useState(Colors.orange);
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState('06:00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [saving, setSaving] = useState(false);

  const canCreate = isPro || habits.length < 3;
  const stepIndex = STEPS.indexOf(step);

  const endTime = (() => {
    const [h, m] = startTime.split(':').map(Number);
    const end = new Date();
    end.setHours(h, m + duration, 0, 0);
    return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  })();

  const goNext = () => {
    if (step === 'basics') {
      if (!name.trim()) {
        Alert.alert('Name required', 'Please name your habit.');
        return;
      }
      setStep('schedule');
    } else if (step === 'schedule') {
      if (days.length === 0) {
        Alert.alert('Select days', 'Choose at least one day.');
        return;
      }
      setStep('locks');
    } else if (step === 'locks') {
      setStep('confirm');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goBack = () => {
    if (step === 'schedule') setStep('basics');
    else if (step === 'locks') setStep('schedule');
    else if (step === 'confirm') setStep('locks');
    else router.back();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    if (!canCreate) {
      Alert.alert('Upgrade to Pro', 'Free plan is limited to 3 habits. Upgrade to Pro for unlimited habits.');
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addHabit({ name: name.trim(), emoji, color, duration, startTime, endTime, days, blockedApps });
    setSaving(false);
    router.back();
  };

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleApp = (app: BlockedApp) => {
    setBlockedApps(prev =>
      prev.find(a => a.id === app.id) ? prev.filter(a => a.id !== app.id) : [...prev, app]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn}>
            <X size={20} color={Colors.textSub} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === 'basics' ? 'New Habit' :
             step === 'schedule' ? 'Schedule' :
             step === 'locks' ? 'App Locks' : 'Confirm'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                { backgroundColor: i <= stepIndex ? Colors.orange : Colors.bgCardAlt },
              ]}
            />
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* BASICS */}
          {step === 'basics' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>What habit are you forging?</Text>

              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Morning Gym, Deep Work..."
                placeholderTextColor={Colors.textMuted}
                autoFocus
                maxLength={40}
              />

              <Text style={styles.label}>Choose an emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map(e => (
                  <Pressable
                    key={e}
                    style={[styles.emojiBtn, emoji === e && { borderColor: color, backgroundColor: color + '22' }]}
                    onPress={() => setEmoji(e)}
                  >
                    <Text style={styles.emojiBtnText}>{e}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Color</Text>
              <View style={styles.colorRow}>
                {HabitColors.map(c => (
                  <Pressable
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <Check size={12} color="#fff" strokeWidth={3} />}
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Duration</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.durationRow}>
                  {DURATIONS.map(d => (
                    <Pressable
                      key={d}
                      style={[styles.durationChip, duration === d && { backgroundColor: color, borderColor: color }]}
                      onPress={() => setDuration(d)}
                    >
                      <Text style={[styles.durationText, duration === d && { color: '#fff' }]}>
                        {d}m
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* SCHEDULE */}
          {step === 'schedule' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>When does it happen?</Text>

              <Text style={styles.label}>Start time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeRow}>
                  {HOURS.map(h => (
                    <Pressable
                      key={h}
                      style={[styles.timeChip, startTime === h && { backgroundColor: color, borderColor: color }]}
                      onPress={() => setStartTime(h)}
                    >
                      <Text style={[styles.timeText, startTime === h && { color: '#fff' }]}>{h}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.timePreview}>
                <Text style={styles.timePreviewLabel}>Window</Text>
                <Text style={styles.timePreviewValue}>{startTime} → {endTime}</Text>
              </View>

              <Text style={styles.label}>Active days</Text>
              <View style={styles.daysRow}>
                {DAYS.map((d, i) => (
                  <Pressable
                    key={d}
                    style={[
                      styles.dayBtn,
                      days.includes(i) && { backgroundColor: color + '33', borderColor: color },
                    ]}
                    onPress={() => toggleDay(i)}
                  >
                    <Text style={[styles.dayBtnText, days.includes(i) && { color: color }]}>
                      {d.charAt(0)}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.quickDays}>
                <Pressable style={styles.quickDayBtn} onPress={() => setDays([1,2,3,4,5])}>
                  <Text style={styles.quickDayText}>Weekdays</Text>
                </Pressable>
                <Pressable style={styles.quickDayBtn} onPress={() => setDays([0,6])}>
                  <Text style={styles.quickDayText}>Weekends</Text>
                </Pressable>
                <Pressable style={styles.quickDayBtn} onPress={() => setDays([0,1,2,3,4,5,6])}>
                  <Text style={styles.quickDayText}>Every day</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* LOCKS */}
          {step === 'locks' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Block these apps during your session</Text>
              <Text style={styles.stepSub}>Selected apps will be restricted for {duration} minutes starting at {startTime}.</Text>

              {BLOCKABLE_APPS.map(app => {
                const selected = blockedApps.find(a => a.id === app.id);
                return (
                  <Pressable
                    key={app.id}
                    style={[styles.appRow, selected && { borderColor: color, backgroundColor: color + '11' }]}
                    onPress={() => toggleApp(app)}
                  >
                    <Text style={styles.appIcon}>{app.icon}</Text>
                    <View style={styles.appInfo}>
                      <Text style={styles.appName}>{app.name}</Text>
                      <Text style={styles.appCategory}>{app.category}</Text>
                    </View>
                    <View style={[styles.checkCircle, selected && { backgroundColor: color, borderColor: color }]}>
                      {selected && <Check size={12} color="#fff" strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* CONFIRM */}
          {step === 'confirm' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ready to forge?</Text>

              <View style={[styles.confirmCard, { borderColor: color + '66' }]}>
                <View style={styles.confirmTop}>
                  <View style={[styles.confirmEmoji, { backgroundColor: color + '22' }]}>
                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                  </View>
                  <View>
                    <Text style={styles.confirmName}>{name}</Text>
                    <Text style={styles.confirmMeta}>{startTime} – {endTime} · {duration}min</Text>
                  </View>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Days</Text>
                  <Text style={styles.confirmValue}>{days.map(d => DAYS[d]).join(', ')}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Blocks</Text>
                  <Text style={styles.confirmValue}>
                    {blockedApps.length > 0 ? blockedApps.map(a => a.name).join(', ') : 'None'}
                  </Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Color</Text>
                  <View style={[styles.confirmColorDot, { backgroundColor: color }]} />
                </View>
              </View>

              {!canCreate && (
                <View style={styles.limitWarn}>
                  <Text style={styles.limitWarnText}>
                    ⚠️ Free plan allows 3 habits. Upgrade to Pro to continue.
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Bottom action */}
        <View style={styles.bottomBar}>
          {step !== 'confirm' ? (
            <Pressable style={[styles.nextBtn, { backgroundColor: color }]} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <ChevronRight size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.nextBtn, { backgroundColor: canCreate ? color : Colors.textMuted }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.nextBtnText}>
                {saving ? 'Saving...' : '🔥 Forge This Habit'}
              </Text>
            </Pressable>
          )}
        </View>
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
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  stepContent: {
    gap: 16,
    paddingTop: 8,
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  stepSub: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: -8,
  },
  nameInput: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  label: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: -8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnText: {
    fontSize: 22,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.15 }],
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationText: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '700',
  },
  timePreview: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePreviewLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  timePreviewValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  quickDays: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDayBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickDayText: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '700',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  appIcon: {
    fontSize: 22,
  },
  appInfo: {
    flex: 1,
    gap: 2,
  },
  appName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  appCategory: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    gap: 14,
  },
  confirmTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  confirmEmoji: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  confirmMeta: {
    color: Colors.textSub,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  confirmValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  confirmColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  limitWarn: {
    backgroundColor: Colors.warningBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  limitWarnText: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 18,
    borderRadius: 18,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
