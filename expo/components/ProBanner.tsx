import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Zap, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface ProBannerProps {
  onUpgrade: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export default function ProBanner({ onUpgrade, onDismiss, compact = false }: ProBannerProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  if (compact) {
    return (
      <Pressable style={styles.compact} onPress={onUpgrade}>
        <Zap size={13} color={Colors.orange} fill={Colors.orange} />
        <Text style={styles.compactText}>Upgrade to Pro</Text>
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.banner, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.bannerLeft}>
        <View style={styles.zapWrap}>
          <Zap size={18} color={Colors.orange} fill={Colors.orange} />
        </View>
        <View>
          <Text style={styles.bannerTitle}>Unlock Pro</Text>
          <Text style={styles.bannerSub}>Unlimited habits · AI reminders · Custom locks</Text>
        </View>
      </View>
      <View style={styles.bannerRight}>
        <Pressable style={styles.upgradeBtn} onPress={onUpgrade}>
          <Text style={styles.upgradeBtnText}>$1.99/mo</Text>
        </Pressable>
        {onDismiss && (
          <Pressable onPress={onDismiss} style={styles.dismiss}>
            <X size={14} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  zapWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerSub: {
    color: Colors.textSub,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeBtn: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  dismiss: {
    padding: 4,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.orangeGlow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compactText: {
    color: Colors.orange,
    fontSize: 12,
    fontWeight: '700',
  },
});
