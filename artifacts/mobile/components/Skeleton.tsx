import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, Easing, StyleProp, ViewStyle } from 'react-native';

/**
 * A pulsing placeholder block, sized to whatever it stands in for.
 *
 * Use these to hold the shape of content that is still loading, instead of a
 * spinner — the layout stays put and nothing jumps when the data lands.
 */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: '#1a5048', opacity: pulse },
        style,
      ]}
    />
  );
}
