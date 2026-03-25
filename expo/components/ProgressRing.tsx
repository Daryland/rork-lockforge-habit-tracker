import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor?: string;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  bgColor = 'rgba(30, 58, 138, 0.3)',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [displayProgress, setDisplayProgress] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = animValue.addListener(({ value }) => {
      setDisplayProgress(value);
    });
    Animated.timing(animValue, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(listener);
  }, [progress, animValue]);

  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>        <G>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {children}
    </View>
  );
}
