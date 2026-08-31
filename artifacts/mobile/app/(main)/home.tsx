import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { SERVICE_IDS, SERVICE_INFO } from '@/constants/services';
import type { TranslationKey } from '@/i18n';
import { FONT } from '@/lib/typography';
import { alignStart } from '@/lib/direction';

// The tiles come from the shared list — labels resolve at render, never here.
// 'notifications' lives in the header bell, which calls openService('notifications').

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { phone, username, authMethod } = useAuth();
  const { t } = useLocale();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const displayName = authMethod === 'password' || authMethod === 'google' ? username : phone;

  function openService(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(main)/service', params: { service: id } });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 12, paddingBottom: botPad + 34 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, alignStart()]}>{t('home.greeting')}</Text>
            <Text style={[styles.name, alignStart()]}>{displayName || t('profile.fallbackName')}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerBtn} onPress={() => openService('notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/(main)/profile')}
              accessibilityLabel={t('home.openProfile')}
            >
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.brandRow}>
          <Text style={[styles.brand, alignStart()]}>Qar</Text>
          <Text style={[styles.brandSub, alignStart()]}>{t('home.tagline')}</Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={[styles.sectionTitle, alignStart()]}>{t('home.findTitle')}</Text>
          <Text style={[styles.searchSubtitle, alignStart()]}>{t('home.findSubtitle')}</Text>
          <View style={styles.searchRow}>
            <Pressable
              style={({ pressed }) => [styles.searchOption, pressed && styles.optionPressed]}
              onPress={() => router.push('/(main)/scanner')}
            >
              <View style={styles.searchIcon}><Ionicons name="scan-outline" size={21} color="#082926" /></View>
              <View style={styles.searchText}>
                <Text style={[styles.searchLabel, alignStart()]} numberOfLines={1} maxFontSizeMultiplier={1.2}>{t('home.scanQr')}</Text>
                <Text style={[styles.searchHint, alignStart()]} numberOfLines={1} maxFontSizeMultiplier={1.2}>{t('home.scanQrHint')}</Text>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.searchOption, pressed && styles.optionPressed]}
              onPress={() => router.push('/(main)/search-car')}
            >
              <View style={styles.searchIcon}><Ionicons name="search-outline" size={21} color="#082926" /></View>
              <View style={styles.searchText}>
                <Text style={[styles.searchLabel, alignStart()]} numberOfLines={1} maxFontSizeMultiplier={1.2}>{t('home.carNumber')}</Text>
                <Text style={[styles.searchHint, alignStart()]} numberOfLines={1} maxFontSizeMultiplier={1.2}>{t('home.carNumberHint')}</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, alignStart()]}>{t('home.services')}</Text>
          <Text style={[styles.sectionCaption, alignStart()]}>{t('home.servicesCaption')}</Text>
        </View>
        <View style={styles.servicesGrid}>
          {SERVICE_IDS.map(id => {
            const meta = SERVICE_INFO[id];
            return (
              <Pressable
                key={id}
                style={({ pressed }) => [styles.serviceCard, pressed && styles.optionPressed]}
                onPress={() => openService(id)}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${meta.color}22` }]}>
                  <Ionicons name={meta.icon as any} size={25} color={meta.color} />
                </View>
                <Text style={[styles.serviceLabel, alignStart()]}>{t(meta.labelKey as TranslationKey)}</Text>
                <Text style={[styles.serviceSubtitle, alignStart()]}>{t(meta.subtitleKey as TranslationKey)}</Text>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  content: { paddingHorizontal: 20, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae' },
  name: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF', marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 },
  brand: { fontSize: 34, fontFamily: FONT.bold, color: '#FFFFFF', letterSpacing: 2 },
  brandSub: { fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae' },
  searchCard: { backgroundColor: '#0e3b33', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1a5048', gap: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  sectionTitle: { fontSize: 19, fontFamily: FONT.bold, color: '#FFFFFF' },
  sectionCaption: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae' },
  searchSubtitle: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  // No chevron: at 2-up these chips are too narrow for one. On anything below an
  // iPhone Pro Max the arrow stole the ~23pt that 'Use your camera' needs, so the
  // hint wrapped to two lines and the two chips ended up different heights.
  // minHeight keeps them identical even if a label ever does have to ellipsize.
  searchOption: { flex: 1, minHeight: 56, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5f0ed', justifyContent: 'center', alignItems: 'center' },
  searchText: { flex: 1 },
  searchLabel: { fontSize: 13, fontFamily: FONT.bold, color: '#082926' },
  searchHint: { fontSize: 10, fontFamily: FONT.regular, color: '#4a8a82', marginTop: 2 },
  optionPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  // Fixed half-width cards, with space-between pushing each row out to both edges.
  // Every card is the same size, and an odd last one simply sits at the left.
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, justifyContent: 'space-between' },
  serviceCard: { width: '48.5%', minHeight: 112, backgroundColor: '#0e3b33', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1a5048' },
  serviceIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  serviceLabel: { fontSize: 15, fontFamily: FONT.semibold, color: '#FFFFFF' },
  serviceSubtitle: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 3, lineHeight: 16 },
});