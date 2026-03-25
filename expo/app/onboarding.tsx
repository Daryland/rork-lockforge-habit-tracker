import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Shield, Heart, Zap, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: <Lock size={56} color={Colors.orange} strokeWidth={1.5} />,
    title: 'Forge\nUnbreakable\nHabits',
    subtitle: 'LockForge blocks distracting apps during your habit windows — so nothing can stop you.',
    accent: Colors.orange,
  },
  {
    id: '2',
    icon: <Shield size={56} color={Colors.navyLight} strokeWidth={1.5} />,
    title: 'Lock Out\nDistraction',
    subtitle: 'We block Instagram, TikTok & games during your sessions. You said you want focus — we enforce it.',
    accent: Colors.navyLight,
  },
  {
    id: '3',
    icon: <Heart size={56} color="#EC4899" strokeWidth={1.5} />,
    title: 'Track With\nApple Health',
    subtitle: 'Auto-complete habits using steps, workouts, and sleep data from Apple Health.',
    accent: '#EC4899',
  },
  {
    id: '4',
    icon: <Zap size={56} color={Colors.orange} strokeWidth={1.5} />,
    title: 'Start\nForging',
    subtitle: 'Your first 3 habits are free. Go Pro for unlimited habits, AI reminders & custom locks.',
    accent: Colors.orange,
    isFinal: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useHabits();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const isFinal = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Animated.FlatList
          ref={flatRef}
          data={SLIDES}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={[styles.iconWrap, { backgroundColor: item.accent + '18' }]}>
                <View style={[styles.iconInner, { backgroundColor: item.accent + '28' }]}>
                  {item.icon}
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          )}
        />

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[styles.dot, { width: dotWidth, opacity }]}
                />
              );
            })}
          </View>

          <Pressable
            style={[styles.btn, isFinal && styles.btnFinal]}
            onPress={isFinal ? handleFinish : goNext}
          >
            <Text style={styles.btnText}>
              {isFinal ? '🔥 Start Forging' : 'Continue'}
            </Text>
          </Pressable>

          {!isFinal && (
            <Pressable onPress={handleFinish}>
              <Text style={styles.skip}>Skip</Text>
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
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
    paddingBottom: 40,
  },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconInner: {
    width: 110,
    height: 110,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'left',
    letterSpacing: -1.5,
    lineHeight: 46,
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: Colors.textSub,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  bottom: {
    paddingHorizontal: 28,
    paddingBottom: 16,
    gap: 18,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
  },
  btn: {
    backgroundColor: Colors.navy,
    borderRadius: 18,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  btnFinal: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orangeDark,
  },
  btnText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  skip: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
