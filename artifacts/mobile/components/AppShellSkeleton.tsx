import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { rootDirection } from '@/lib/direction';

/**
 * The app's silhouette, shown wherever a real screen is not ready yet.
 *
 * Two places use it: the language sheet while the app restarts, and `app/index.tsx`
 * while the session hydrates from AsyncStorage. Both used to be a bare spinner on an
 * empty background, which reads as "something broke" rather than "almost there".
 *
 * Deliberately **text-free**. It has to be able to render before the locale is resolved
 * and before the font aliases are bound, so it must not depend on either — which also
 * means it never needs translating.
 *
 * Two shapes, because the gate is crossed on the way to two different screens: `app` for
 * a signed-in user landing on Home, `auth` for a signed-out one landing on Welcome. A
 * Home-shaped skeleton resolving into a login screen is worse than no skeleton at all.
 */
export function AppShellSkeleton({
  topInset,
  variant = 'app',
}: {
  topInset?: number;
  variant?: 'app' | 'auth';
}) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    // The direction is set here rather than inherited: one caller renders inside a
    // `Modal`, which is a separate native root and does not inherit the app root's
    // Yoga direction.
    <View style={[styles.root, rootDirection(), { paddingTop: (topInset ?? 0) + 24 }]}>
      <Animated.View style={{ opacity: pulse }}>
        {variant === 'auth' ? (
          <View style={styles.authWrap}>
            <View style={styles.logo} />
            <View style={[styles.bar, { width: 220 }]} />
            <View style={styles.primaryBtn} />
            <View style={styles.authRow} />
            <View style={styles.authRow} />
          </View>
        ) : (
          <>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={[styles.bar, { width: 96 }]} />
            <View style={[styles.bar, { width: 150, height: 20 }]} />
          </View>
          <View style={styles.headerActions}>
            <View style={styles.circle} />
            <View style={styles.circle} />
          </View>
        </View>

        <View style={styles.hero} />

        <View style={[styles.bar, { width: 120, height: 22, marginBottom: 16 }]} />
        <View style={styles.grid}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={styles.tile} />
          ))}
        </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/** Same skeleton, filling the screen — for the gates that own the whole viewport. */
export function AppShellSkeletonScreen({ variant }: { variant?: 'app' | 'auth' }) {
  const insets = useSafeAreaInsets();
  return <AppShellSkeleton topInset={insets.top} variant={variant} />;
}

const BLOCK = 'rgba(255,255,255,0.07)';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#082926', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerText: { gap: 8 },
  headerActions: { flexDirection: 'row', gap: 10 },
  circle: { width: 44, height: 44, borderRadius: 22, backgroundColor: BLOCK },
  bar: { height: 14, borderRadius: 7, backgroundColor: BLOCK },
  hero: {
    height: 168,
    borderRadius: 20,
    backgroundColor: BLOCK,
    borderWidth: 1,
    borderColor: '#1a5048',
    marginBottom: 32,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  authWrap: { alignItems: 'center', gap: 18, paddingTop: 40 },
  logo: { width: 160, height: 160, borderRadius: 32, backgroundColor: BLOCK },
  primaryBtn: { width: '100%', height: 64, borderRadius: 16, backgroundColor: BLOCK, marginTop: 40 },
  authRow: {
    width: '100%', height: 84, borderRadius: 16, backgroundColor: BLOCK,
    borderWidth: 1, borderColor: '#1a5048',
  },
  tile: {
    width: '48.5%',
    height: 132,
    borderRadius: 18,
    backgroundColor: BLOCK,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
});
