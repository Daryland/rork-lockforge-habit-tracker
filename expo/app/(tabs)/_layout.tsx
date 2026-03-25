import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Flame, BarChart2, Settings, CalendarDays } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHabits } from '@/hooks/useHabits';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ icon, color, focused }: { icon: React.ReactNode; color: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {icon}
    </View>
  );
}

export default function TabLayout() {
  const { onboarded, isLoaded } = useHabits();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && onboarded === false) {
      router.replace('/onboarding');
    }
  }, [isLoaded, onboarded]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.orange,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={<Flame size={22} color={color} fill={focused ? color : 'transparent'} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: 'Streaks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={<CalendarDays size={22} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={<BarChart2 size={22} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              icon={<Settings size={22} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: Colors.orangeGlow,
  },
});
