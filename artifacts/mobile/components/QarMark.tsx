import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '@/lib/typography';
import { latinLetterSpacing } from '@/lib/typography';

/**
 * The Qar brand mark, drawn rather than imported.
 *
 * It replaces `assets/images/logo.png` on the welcome screen. That was the raster app
 * icon — a white-backed tile that fought the dark theme, showed compression artefacts at
 * display size, and read as an icon pasted onto a screen rather than a brand.
 *
 * The composition is the product: a **scan frame closing around a car**. The four
 * L-brackets are the same motif the app already uses on `scanner.tsx` and
 * `qr-display.tsx`, so the mark belongs to the same visual language instead of being a
 * foreign object. Being vector, it is crisp at any density, takes the palette from the
 * design system, and needs no asset.
 *
 * Corners use logical `start`/`end` on both position and border so the frame mirrors as
 * a whole under RTL — mixing physical `left` with `borderLeftWidth` is what pulls these
 * brackets apart (see docs/known-issues.md §8).
 */
const TILE = 116;
const FRAME = 156;
const CORNER = 30;

export function QarMark() {
  const enter = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // A slow breath on the frame only — it reads as "scanning", and one looping driver
    // on opacity is cheap enough to leave running on an idle screen.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.35, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, glow]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

  return (
    <Animated.View style={{ opacity: enter, transform: [{ scale }] }}>
      <View style={styles.frame}>
        <Animated.View style={[styles.corner, styles.cTS, { opacity: glow }]} />
        <Animated.View style={[styles.corner, styles.cTE, { opacity: glow }]} />
        <Animated.View style={[styles.corner, styles.cBS, { opacity: glow }]} />
        <Animated.View style={[styles.corner, styles.cBE, { opacity: glow }]} />

        <LinearGradient
          colors={['#1e6b60', '#0e3b33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <Ionicons name="car-sport" size={54} color="#FFFFFF" />
        </LinearGradient>
      </View>

      <Animated.Text style={[styles.wordmark, latinLetterSpacing(2)]}>Qar</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: FRAME,
    height: FRAME,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#4ade80',
  },
  cTS: { top: 0, start: 0, borderTopWidth: 3, borderStartWidth: 3, borderTopStartRadius: 12 },
  cTE: { top: 0, end: 0, borderTopWidth: 3, borderEndWidth: 3, borderTopEndRadius: 12 },
  cBS: { bottom: 0, start: 0, borderBottomWidth: 3, borderStartWidth: 3, borderBottomStartRadius: 12 },
  cBE: { bottom: 0, end: 0, borderBottomWidth: 3, borderEndWidth: 3, borderBottomEndRadius: 12 },

  wordmark: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 40,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
});
