import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LanguageSheet } from '@/components/LanguageSheet';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { FONT } from '@/lib/typography';
import type { LegalSlug } from '@/constants/legal';
import { flipIfRTL, mirrorIcon } from '@/lib/rtl';
import { alignStart } from '@/lib/direction';

/**
 * Everything that is a setting rather than personal content.
 *
 * Split out of Profile, which had grown to identity + Account + My Cars + three Legal
 * rows + Log out and had no natural home for a language switch. Rows here are
 * uniformly navigational — label, optional value, chevron — so they read differently
 * from Profile's read-only Account rows.
 */
function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={18} color="#7fb5ae" />
      </View>
      <Text style={[styles.rowLabel, alignStart()]} numberOfLines={1}>
        {label}
      </Text>
      {!!value && (
        <Text style={[styles.rowValue, alignStart()]} numberOfLines={1}>
          {value}
        </Text>
      )}
      <Ionicons name={mirrorIcon('chevron-forward')} size={18} color="#7fb5ae" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { locale, t } = useLocale();
  const [sheetOpen, setSheetOpen] = useState(false);

  function openLegal(doc: LegalSlug) {
    router.push({ pathname: '/legal/[doc]', params: { doc } });
  }

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/welcome');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.back()}
          >
            <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={[styles.headerTitle, alignStart()]}>{t('settings.title')}</Text>
          <View style={{ width: 44 }} />
        </View>

        <Text style={[styles.sectionTitle, alignStart()]}>{t('settings.preferences')}</Text>
        <View style={styles.card}>
          <Row
            icon="language-outline"
            label={t('settings.language')}
            value={locale === 'ar' ? t('language.arabic') : t('language.english')}
            onPress={() => setSheetOpen(true)}
          />
        </View>

        <Text style={[styles.sectionTitle, alignStart()]}>{t('settings.legal')}</Text>
        <View style={styles.card}>
          <Row
            icon="shield-checkmark-outline"
            label={t('legal.privacy')}
            onPress={() => openLegal('privacy')}
          />
          <View style={styles.divider} />
          <Row icon="card-outline" label={t('legal.refund')} onPress={() => openLegal('refund')} />
          <View style={styles.divider} />
          <Row
            icon="document-text-outline"
            label={t('legal.terms')}
            onPress={() => openLegal('terms')}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={flipIfRTL()} />
          <Text style={[styles.logoutText, alignStart()]}>{t('settings.logOut')}</Text>
        </Pressable>
      </ScrollView>

      <LanguageSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  content: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF' },

  sectionTitle: { fontSize: 19, fontFamily: FONT.bold, color: '#FFFFFF', marginTop: 6 },
  card: {
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#082926',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: FONT.medium, color: '#FFFFFF' },
  rowValue: { fontSize: 14, fontFamily: FONT.regular, color: '#7fb5ae' },
  // marginStart, not marginLeft — this indent must follow the icon under RTL.
  divider: { height: 1, backgroundColor: '#1a5048', marginStart: 50 },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    marginTop: 10,
  },
  logoutPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  logoutText: { fontSize: 16, fontFamily: FONT.semibold, color: '#ef4444' },
});
