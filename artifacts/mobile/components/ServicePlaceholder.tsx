import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_INFO } from '@/constants/services';
import { FONT } from '@/lib/typography';
import { useLocale } from '@/context/LocaleContext';
import type { TranslationKey } from '@/i18n';
import { mirrorIcon } from '@/lib/rtl';
import { alignStart } from '@/lib/direction';

/** The original static service screen, kept for tiles with no merchant data behind them. */
export function ServicePlaceholder({ service }: { service: string }) {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const info = SERVICE_INFO[service ?? ''] ?? SERVICE_INFO.maintenance;
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" /></Pressable>
        <Text style={[styles.title, alignStart()]}>{t(info.labelKey as TranslationKey)}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: `${info.color}22` }]}>
          <Ionicons name={info.icon as any} size={42} color={info.color} />
        </View>
        <Text style={[styles.heading, alignStart()]}>{t(info.labelKey as TranslationKey)}</Text>
        <Text style={styles.description}>{t(info.descriptionKey as TranslationKey)}</Text>
        <View style={styles.comingSoon}>
          <Ionicons name="time-outline" size={18} color="#7fb5ae" />
          <Text style={[styles.comingSoonText, alignStart()]}>{t('common.comingSoon')}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF' },
  content: { padding: 24, alignItems: 'center', gap: 14 },
  heroIcon: { width: 92, height: 92, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  heading: { fontSize: 28, fontFamily: FONT.bold, color: '#FFFFFF', marginTop: 6 },
  description: { fontSize: 15, fontFamily: FONT.regular, color: '#7fb5ae', textAlign: 'center', lineHeight: 22, maxWidth: 290 },
  items: { width: '100%', gap: 10, marginTop: 18 },
  item: { backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048', borderRadius: 15, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { fontSize: 16, fontFamily: FONT.semibold, color: '#FFFFFF' },
  comingSoon: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  comingSoonText: { fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae' },
});