import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppShellSkeleton } from '@/components/AppShellSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { FONT } from '@/lib/typography';
import type { Locale } from '@/i18n';
import { alignStart } from '@/lib/direction';

const OPTIONS: { value: Locale; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'ar', label: 'Arabic', native: 'العربية' },
];

/**
 * Bottom sheet for choosing the app language.
 *
 * A plain RN `Modal` — a two-option picker does not justify a gesture-driven sheet
 * library. Switching no longer restarts the app (see `lib/fonts.ts`), so this is now a
 * near-instant swap; `switching` only covers the font-alias rebind.
 */
export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { locale, setLocale, switching, t } = useLocale();
  // The switch remounts the navigator, so the user lands on Home or Welcome depending on
  // the session — the skeleton should be the shape of wherever they are about to land.
  const { isAuthenticated } = useAuth();

  async function choose(next: Locale) {
    if (next === locale) {
      onClose();
      return;
    }
    await Haptics.selectionAsync();
    // The sheet is NOT dismissed first: `switching` swaps this modal's content for the
    // skeleton, so the sheet slides away into the loading state instead of the app
    // blinking out from under a dismiss animation. `onClose` runs only if the restart
    // turns out to be a no-op.
    await setLocale(next); // persists, flips direction, then reloads
    onClose();
  }

  // While the app restarts, show the app's silhouette. The user lands back on the same
  // shape once the reload finishes, so the switch reads as a screen loading rather than
  // the app disappearing. (In Expo Go the client's own white loader still appears in the
  // middle of this — no JS of ours runs during it. See docs/known-issues.md §9.)
  if (switching) {
    return (
      <Modal visible transparent={false} animationType="fade" statusBarTranslucent>
        <AppShellSkeleton topInset={insets.top} variant={isAuthenticated ? 'app' : 'auth'} />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={switching ? undefined : onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.grabber} />
        <Text style={[styles.title, alignStart()]}>{t('settings.language')}</Text>

        {OPTIONS.map(option => {
          const active = option.value === locale;
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.row,
                active && styles.rowActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => choose(option.value)}
              disabled={switching}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.rowLabel, alignStart(), active && styles.rowLabelActive]}>
                {option.native}
              </Text>
              {active && <Ionicons name="checkmark-circle" size={22} color="#4ade80" />}
            </Pressable>
          );
        })}

        <Text style={[styles.notice, alignStart()]}>{t('language.applyNotice')}</Text>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(8,41,38,0.6)' },
  sheet: {
    backgroundColor: '#0e3b33',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1a5048',
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 10,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a5048',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 19, fontFamily: FONT.bold, color: '#FFFFFF', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a5048',
    backgroundColor: '#082926',
  },
  rowActive: { borderColor: '#4ade80' },
  rowLabel: { fontSize: 16, fontFamily: FONT.medium, color: '#7fb5ae' },
  rowLabelActive: { color: '#FFFFFF', fontFamily: FONT.semibold },
  notice: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 4 },
});
