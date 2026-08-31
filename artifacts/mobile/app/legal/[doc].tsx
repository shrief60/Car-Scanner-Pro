import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_DOCS, LegalSlug } from '@/constants/legal';

/**
 * Renders any of the legal documents.
 *
 * Lives at the root (not under `(main)`) because Create Account links to the Terms
 * before the user is signed in, so both the auth and main stacks need to reach it.
 *
 * The bodies are Arabic, so text blocks are laid out right-to-left individually
 * (`writingDirection` + `textAlign` + a reversed bullet row). The app is NOT flipped
 * with `I18nManager.forceRTL` — that restarts the app and mirrors every other screen.
 */
export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const legal = LEGAL_DOCS[doc as LegalSlug] ?? LEGAL_DOCS.terms;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{legal.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.docTitle}>{legal.arabicTitle}</Text>
        <Text style={styles.updated}>آخر تحديث: {legal.lastUpdated}</Text>

        {legal.blocks.map((block, i) => {
          if (block.type === 'heading') {
            return (
              <Text key={i} style={styles.heading}>
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
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {block.text}
            </Text>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** Arabic body text: right-aligned, RTL, with generous line height for legibility. */
const rtl = { textAlign: 'right', writingDirection: 'rtl' } as const;

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },

  content: { paddingHorizontal: 20, paddingTop: 8 },
  docTitle: { ...rtl, fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF', lineHeight: 34 },
  updated: {
    ...rtl,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    marginTop: 6,
    marginBottom: 18,
  },
  heading: {
    ...rtl,
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    lineHeight: 28,
    marginTop: 26,
    marginBottom: 10,
  },
  paragraph: {
    ...rtl,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#cfe3df',
    lineHeight: 27,
    marginBottom: 12,
  },
  bullets: { marginBottom: 12, gap: 8 },
  // row-reverse puts the dot on the right, where an Arabic reader expects it.
  bulletRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
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
    fontFamily: 'Inter_400Regular',
    color: '#cfe3df',
    lineHeight: 27,
  },
});
