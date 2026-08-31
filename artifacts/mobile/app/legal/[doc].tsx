import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_DOCS, LegalSlug } from '@/constants/legal';
import { useLocale } from '@/context/LocaleContext';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignStart } from '@/lib/direction';

/**
 * Renders any of the legal documents.
 *
 * Lives at the root (not under `(main)`) because Create Account links to the Terms
 * before the user is signed in, so both the auth and main stacks need to reach it.
 *
 * Each document exists in both languages, so the body follows the UI locale — which means
 * document language and app direction can no longer disagree. Alignment therefore comes
 * from the shared `alignStart()`, and the per-document `rtl`/`ltr` pair carries only the
 * paragraph's base writing direction. Row layouts need no help: the root view's Yoga
 * `direction` already mirrors them.
 */
export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { locale, t } = useLocale();
  const legal = LEGAL_DOCS[doc as LegalSlug] ?? LEGAL_DOCS.terms;
  // Arabic always renders RTL; English renders in the app's own direction.
  const isArabicBody = locale === 'ar';

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{t(`legal.${legal.slug}` as never)}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.docTitle, alignStart(), !isArabicBody && ltr]}>{legal.title[locale]}</Text>
        <Text style={[styles.updated, alignStart(), !isArabicBody && ltr]}>
          {t('legal.lastUpdated')}: {legal.lastUpdated[locale]}
        </Text>

        {legal.body[locale].map((block, i) => {
          if (block.type === 'heading') {
            return (
              <Text key={i} style={[styles.heading, alignStart(), !isArabicBody && ltr]}>
                {block.text}
              </Text>
            );
          }
          if (block.type === 'bullets') {
            return (
              <View key={i} style={styles.bullets}>
                {block.items.map((item, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <View style={styles.dot} />
                    <Text style={[styles.bulletText, alignStart(), !isArabicBody && ltr]}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text key={i} style={[styles.paragraph, alignStart(), !isArabicBody && ltr]}>
              {block.text}
            </Text>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Arabic body text: right-aligned, RTL, with generous line height for legibility. */
// Alignment comes from `alignStart()` — an explicit `textAlign: 'right'` is mirrored
// by the platform inside an RTL subtree and lands on the left. These carry only the
// paragraph's base direction (iOS; Android derives it from the text itself).
const rtl = { writingDirection: 'rtl' } as const;
/** English bodies read left-to-right even inside an RTL app. */
const ltr = { writingDirection: 'ltr' } as const;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: FONT.bold, color: '#FFFFFF' },

  content: { paddingHorizontal: 20, paddingTop: 8 },
  docTitle: { ...rtl, fontSize: 22, fontFamily: FONT.bold, color: '#FFFFFF', lineHeight: 34 },
  updated: {
    ...rtl,
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#7fb5ae',
    marginTop: 6,
    marginBottom: 18,
  },
  heading: {
    ...rtl,
    fontSize: 17,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
    lineHeight: 28,
    marginTop: 26,
    marginBottom: 10,
  },
  paragraph: {
    ...rtl,
    fontSize: 15,
    fontFamily: FONT.regular,
    color: '#cfe3df',
    lineHeight: 27,
    marginBottom: 12,
  },
  bullets: { marginBottom: 12, gap: 8 },
  // Plain `row`: the root direction puts the dot on the right in Arabic and on the
  // left in English on its own. Reversing it by hand would double-flip.
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4ade80',
    marginTop: 11,
  },
  bulletText: {
    ...rtl,
    flex: 1,
    fontSize: 15,
    fontFamily: FONT.regular,
    color: '#cfe3df',
    lineHeight: 27,
  },
});
