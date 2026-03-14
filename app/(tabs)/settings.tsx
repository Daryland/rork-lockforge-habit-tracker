import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Shield, Bell, Heart, Download, ChevronRight, Check, Lock, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
}

function SettingRow({ icon, iconBg, title, subtitle, onPress, rightEl }: SettingRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {rightEl ?? (onPress && <ChevronRight size={16} color={Colors.textMuted} />)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { isPro, upgradeToPro, habits } = useHabits();
  const [notifications, setNotifications] = useState(true);
  const [healthSync, setHealthSync] = useState(true);
  const [aiReminders, setAiReminders] = useState(false);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '⚡ LockForge Pro — Coming Soon',
      'In-app purchases are launching soon!\n\nLockForge Pro will unlock:\n✅ Unlimited habits\n✅ AI reminders & insights\n✅ Custom lock rules\n✅ Export data\n✅ Emergency lock PIN\n✅ Priority support\n\nStay tuned for $4.99/month.',
      [{ text: 'Got It!', style: 'default' }]
    );
  };

  const handleExport = () => {
    if (!isPro) {
      Alert.alert('🔒 Pro Feature — Coming Soon', 'Data export is part of LockForge Pro. In-app purchases are launching soon!');
      return;
    }
    Alert.alert('Export', 'Your habit data has been exported to CSV.');
  };

  const handleScreenTime = () => {
    Alert.alert(
      'Screen Time Integration',
      'LockForge uses Apple Screen Time API to block distracting apps during your habit windows.\n\nGo to Settings → Screen Time to grant permission.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Pro card */}
          {!isPro ? (
            <Pressable style={styles.proCard} onPress={handleUpgrade}>
              <View style={styles.proCardLeft}>
                <View style={styles.proZap}>
                  <Zap size={22} color={Colors.orange} fill={Colors.orange} />
                </View>
                <View>
                  <Text style={styles.proTitle}>LockForge Pro</Text>
                  <Text style={styles.proSub}>Unlimited habits · AI · Custom locks</Text>
                </View>
              </View>
              <View style={styles.proPrice}>
                <Text style={styles.proPriceText}>$4.99</Text>
                <Text style={styles.proPriceSub}>/mo</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.proActiveCard}>
              <View style={styles.proActiveLeft}>
                <Star size={20} color={Colors.orange} fill={Colors.orange} />
                <Text style={styles.proActiveText}>LockForge Pro · Active</Text>
              </View>
              <View style={styles.proActiveBadge}>
                <Check size={12} color={Colors.success} />
                <Text style={styles.proActiveBadgeText}>Subscribed</Text>
              </View>
            </View>
          )}

          {/* Quick stats */}
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipNum}>{habits.length}</Text>
              <Text style={styles.statChipLabel}>Habits</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipNum}>{isPro ? '∞' : `${3 - habits.length}`}</Text>
              <Text style={styles.statChipLabel}>{isPro ? 'Unlimited' : 'Remaining'}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statChipNum}>{habits.reduce((s, h) => s + h.blockedApps.length, 0)}</Text>
              <Text style={styles.statChipLabel}>Locks</Text>
            </View>
          </View>

          {/* Integrations */}
          <Text style={styles.section}>Integrations</Text>
          <View style={styles.group}>
            <SettingRow
              icon={<Shield size={16} color="#fff" />}
              iconBg={Colors.navy}
              title="Screen Time"
              subtitle="Block apps during sessions"
              onPress={handleScreenTime}
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Heart size={16} color="#fff" />}
              iconBg="#EC4899"
              title="Apple Health"
              subtitle="Auto-complete via steps & workouts"
              rightEl={
                <Switch
                  value={healthSync}
                  onValueChange={setHealthSync}
                  trackColor={{ false: Colors.bgCardAlt, true: Colors.orange }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Text style={{ fontSize: 14 }}>⌚</Text>}
              iconBg={Colors.navyMid}
              title="Apple Watch"
              subtitle="Complication sync"
              onPress={() => Alert.alert('Apple Watch', 'Apple Watch sync requires a physical device. Pair your watch in the Watch app.')}
            />
          </View>

          {/* Notifications */}
          <Text style={styles.section}>Notifications</Text>
          <View style={styles.group}>
            <SettingRow
              icon={<Bell size={16} color="#fff" />}
              iconBg={Colors.navyLight}
              title="Habit Reminders"
              subtitle="Get notified when a window opens"
              rightEl={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.bgCardAlt, true: Colors.orange }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon={<Zap size={16} color="#fff" />}
              iconBg={isPro ? Colors.orange : Colors.textMuted}
              title="AI Reminders"
              subtitle={isPro ? "GPT-4o-mini personalized nudges" : "Pro feature"}
              rightEl={
                isPro ? (
                  <Switch
                    value={aiReminders}
                    onValueChange={setAiReminders}
                    trackColor={{ false: Colors.bgCardAlt, true: Colors.orange }}
                    thumbColor="#fff"
                  />
                ) : (
                  <View style={styles.proTag}>
                    <Text style={styles.proTagText}>PRO</Text>
                  </View>
                )
              }
            />
          </View>

          {/* Locks */}
          <Text style={styles.section}>Lock Settings</Text>
          <View style={styles.group}>
            <SettingRow
              icon={<Lock size={16} color="#fff" />}
              iconBg={Colors.error}
              title="Emergency PIN"
              subtitle={isPro ? "Set a PIN to break locks" : "Pro feature"}
              onPress={() => {
                if (!isPro) {
                  Alert.alert('🔒 Pro Feature — Coming Soon', 'Emergency PIN is part of LockForge Pro. In-app purchases are launching soon!');
                  return;
                }
                Alert.alert('Emergency PIN', 'Set a 6-digit PIN to bypass locks in emergencies.');
              }}
              rightEl={
                !isPro ? <View style={styles.proTag}><Text style={styles.proTagText}>PRO</Text></View> : undefined
              }
            />
          </View>

          {/* Data */}
          <Text style={styles.section}>Data</Text>
          <View style={styles.group}>
            <SettingRow
              icon={<Download size={16} color="#fff" />}
              iconBg={Colors.success}
              title="Export Data"
              subtitle={isPro ? "Download CSV of all habits" : "Pro feature"}
              onPress={handleExport}
              rightEl={
                !isPro ? <View style={styles.proTag}><Text style={styles.proTagText}>PRO</Text></View> : undefined
              }
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>LockForge v1.0.0</Text>
            <Text style={styles.footerSub}>Forge discipline. Block distraction.</Text>
          </View>

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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  proCard: {
    backgroundColor: Colors.orange,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  proCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proZap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  proSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  proPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  proPriceText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  proPriceSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  proActiveCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.success + '44',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  proActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proActiveText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  proActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proActiveBadgeText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 3,
  },
  statChipNum: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statChipLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  group: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 64,
  },
  proTag: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 4,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
