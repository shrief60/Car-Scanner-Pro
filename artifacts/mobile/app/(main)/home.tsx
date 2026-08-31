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

const SERVICES = [
  { id: 'maintenance', label: 'Maintenance', subtitle: 'Keep your car running', icon: 'construct-outline', color: '#4ade80' },
  { id: 'accessories', label: 'Accessories', subtitle: 'Upgrade your drive', icon: 'color-palette-outline', color: '#60a5fa' },
  { id: 'marketplace', label: 'Buy & Sell', subtitle: 'Find your next car', icon: 'swap-horizontal-outline', color: '#fbbf24' },
  // 'notifications' lives in the header bell, which calls openService('notifications').
  { id: 'reminders', label: 'Reminders', subtitle: 'Never miss a date', icon: 'calendar-outline', color: '#fb923c' },
  { id: 'sos', label: 'SOS', subtitle: 'Get help fast', icon: 'alert-circle-outline', color: '#f87171' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { phone, username, authMethod } = useAuth();
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
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>{displayName || 'Qar driver'}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerBtn} onPress={() => openService('notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/(main)/profile')}
              accessibilityLabel="Open your profile"
            >
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.brandRow}>
          <Text style={styles.brand}>Qar</Text>
          <Text style={styles.brandSub}>Your car, connected</Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Find a Qar car</Text>
          <Text style={styles.searchSubtitle}>Reach an owner or look up a vehicle</Text>
          <View style={styles.searchRow}>
            <Pressable
              style={({ pressed }) => [styles.searchOption, pressed && styles.optionPressed]}
              onPress={() => router.push('/(main)/scanner')}
            >
              <View style={styles.searchIcon}><Ionicons name="scan-outline" size={24} color="#082926" /></View>
              <View style={styles.searchText}>
                <Text style={styles.searchLabel}>Scan QR</Text>
                <Text style={styles.searchHint}>Use your camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#082926" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.searchOption, pressed && styles.optionPressed]}
              onPress={() => router.push('/(main)/search-car')}
            >
              <View style={styles.searchIcon}><Ionicons name="search-outline" size={24} color="#082926" /></View>
              <View style={styles.searchText}>
                <Text style={styles.searchLabel}>Car Number</Text>
                <Text style={styles.searchHint}>Search by plate</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#082926" />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Services</Text>
          <Text style={styles.sectionCaption}>Everything for your car</Text>
        </View>
        <View style={styles.servicesGrid}>
          {SERVICES.map(service => (
            <Pressable
              key={service.id}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.optionPressed]}
              onPress={() => openService(service.id)}
            >
              <View style={[styles.serviceIcon, { backgroundColor: `${service.color}22` }]}>
                <Ionicons name={service.icon as any} size={25} color={service.color} />
              </View>
              <Text style={styles.serviceLabel}>{service.label}</Text>
              <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  content: { paddingHorizontal: 20, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginTop: 3 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 },
  brand: { fontSize: 34, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 },
  brandSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  searchCard: { backgroundColor: '#0e3b33', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1a5048', gap: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  sectionTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  sectionCaption: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  searchSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchOption: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 13, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5f0ed', justifyContent: 'center', alignItems: 'center' },
  searchText: { flex: 1 },
  searchLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#082926' },
  searchHint: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#4a8a82', marginTop: 2 },
  optionPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  // Fixed half-width cards, with space-between pushing each row out to both edges.
  // Every card is the same size, and an odd last one simply sits at the left.
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, justifyContent: 'space-between' },
  serviceCard: { width: '48.5%', minHeight: 112, backgroundColor: '#0e3b33', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#1a5048' },
  serviceIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  serviceLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  serviceSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3, lineHeight: 16 },
});