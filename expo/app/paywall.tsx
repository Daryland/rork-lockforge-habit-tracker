import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Zap, Shield, Brain, Download, Lock, Check, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useOfferings, usePurchase, useRestorePurchases, useIsProRC } from '@/hooks/useRevenueCat';

const FEATURES = [
  { icon: Shield, label: 'Unlimited habits', desc: 'No cap on habit creation' },
  { icon: Brain, label: 'AI reminders', desc: 'Personalized nudges via GPT-4o' },
  { icon: Lock, label: 'Custom lock rules', desc: 'Block any app during sessions' },
  { icon: Download, label: 'Export data', desc: 'Download CSV of all habits' },
];

export default function PaywallScreen() {
  const { data: offering, isLoading: loadingOfferings } = useOfferings();
  const purchaseMutation = usePurchase();
  const restoreMutation = useRestorePurchases();
  const isPro = useIsProRC();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (isPro) {
      Alert.alert('Welcome to Pro!', 'You now have access to all features.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [isPro]);

  const handlePurchase = async (packageId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await purchaseMutation.mutateAsync(packageId);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      if (e?.userCancelled) return;
      console.error('[Paywall] Purchase error:', e);
      Alert.alert('Purchase Failed', e?.message ?? 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const info = await restoreMutation.mutateAsync();
      const hasPro = info.entitlements?.active?.['pro'] !== undefined;
      if (hasPro) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Restored!', 'Your Pro subscription has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'We couldn\'t find an active subscription for this account.');
      }
    } catch (e: any) {
      console.error('[Paywall] Restore error:', e);
      Alert.alert('Restore Failed', e?.message ?? 'Something went wrong.');
    }
  };

  const packages = offering?.availablePackages ?? [];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} testID="paywall-close">
            <X size={20} color={Colors.textSub} />
          </Pressable>
          <Pressable onPress={handleRestore} disabled={restoreMutation.isPending}>
            <Text style={styles.restoreText}>
              {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View style={styles.heroSection}>
              <View style={styles.iconCircle}>
                <Zap size={32} color={Colors.orange} fill={Colors.orange} />
              </View>
              <Text style={styles.heroTitle}>LockForge Pro</Text>
              <Text style={styles.heroSub}>
                Forge unbreakable discipline with premium tools
              </Text>
            </View>

            <View style={styles.featuresCard}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <f.icon size={16} color={Colors.orange} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureLabel}>{f.label}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                  <Check size={14} color={Colors.success} />
                </View>
              ))}
            </View>

            {loadingOfferings ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={Colors.orange} size="small" />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : packages.length > 0 ? (
              <View style={styles.packagesSection}>
                <Text style={styles.packagesTitle}>Choose your plan</Text>
                {packages.map((pkg) => {
                  const price = pkg.product.priceString;
                  const title = pkg.product.title || pkg.identifier;
                  const isBasic = pkg.identifier === 'basic_monthly';
                  return (
                    <Pressable
                      key={pkg.identifier}
                      style={[styles.packageCard, isBasic && styles.packageCardHighlight]}
                      onPress={() => handlePurchase(pkg.identifier)}
                      disabled={purchaseMutation.isPending}
                      testID={`package-${pkg.identifier}`}
                    >
                      {isBasic && (
                        <View style={styles.bestValueBadge}>
                          <Text style={styles.bestValueText}>BEST VALUE</Text>
                        </View>
                      )}
                      <View style={styles.packageInfo}>
                        <Text style={styles.packageTitle}>{title}</Text>
                        <Text style={styles.packagePrice}>{price}/month</Text>
                      </View>
                      <ArrowRight size={18} color={isBasic ? Colors.orange : Colors.textSub} />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.packagesSection}>
                <Text style={styles.packagesTitle}>Choose your plan</Text>
                <Pressable
                  style={[styles.packageCard, styles.packageCardHighlight]}
                  onPress={() => handlePurchase('basic_monthly')}
                  disabled={purchaseMutation.isPending}
                  testID="package-fallback"
                >
                  <View style={styles.packageInfo}>
                    <Text style={styles.packageTitle}>Monthly</Text>
                    <Text style={styles.packagePrice}>$1.99/month</Text>
                  </View>
                  <ArrowRight size={18} color={Colors.orange} />
                </Pressable>
              </View>
            )}

            {purchaseMutation.isPending && (
              <View style={styles.processingWrap}>
                <ActivityIndicator color={Colors.orange} size="small" />
                <Text style={styles.processingText}>Processing purchase...</Text>
              </View>
            )}

            <Text style={styles.disclaimer}>
              Payment will be charged to your account at confirmation. Subscription auto-renews monthly unless cancelled at least 24 hours before the end of the current period.
            </Text>
          </Animated.View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    color: Colors.textSub,
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroSub: {
    color: Colors.textSub,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  featuresCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.orangeGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  featureDesc: {
    color: Colors.textSub,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadingText: {
    color: Colors.textSub,
    fontSize: 13,
  },
  packagesSection: {
    gap: 10,
    marginBottom: 20,
  },
  packagesTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
    marginLeft: 4,
  },
  packageCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageCardHighlight: {
    borderColor: Colors.orange,
    borderWidth: 1.5,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  packageInfo: {
    gap: 3,
  },
  packageTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  packagePrice: {
    color: Colors.orange,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  processingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  processingText: {
    color: Colors.textSub,
    fontSize: 13,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
});
