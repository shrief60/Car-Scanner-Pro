import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_INFO: Record<string, { label: string; icon: string; color: string; description: string; items: string[] }> = {
  maintenance: { label: 'Maintenance', icon: 'construct-outline', color: '#4ade80', description: 'Keep your car safe, reliable, and ready for the road.', items: ['Book a service', 'Find nearby workshops', 'Service history'] },
  accessories: { label: 'Accessories', icon: 'color-palette-outline', color: '#60a5fa', description: 'Discover accessories that make every drive better.', items: ['Browse accessories', 'Interior upgrades', 'Exterior upgrades'] },
  marketplace: { label: 'Buy & Sell', icon: 'swap-horizontal-outline', color: '#fbbf24', description: 'Buy your next car or list your current one.', items: ['Browse cars for sale', 'Sell your car', 'Saved listings'] },
  notifications: { label: 'Notifications', icon: 'notifications-outline', color: '#c084fc', description: 'Stay updated about your cars and alerts.', items: ['Car alerts', 'Qar updates', 'Account activity'] },
  reminders: { label: 'Reminders', icon: 'calendar-outline', color: '#fb923c', description: 'Keep track of maintenance, renewals, and important dates.', items: ['Add a reminder', 'Upcoming reminders', 'Reminder history'] },
  sos: { label: 'SOS', icon: 'alert-circle-outline', color: '#f87171', description: 'Get help quickly when you need it.', items: ['Emergency contacts', 'Roadside assistance', 'Share my location'] },
};

export default function ServiceScreen() {
  const insets = useSafeAreaInsets();
  const { service } = useLocalSearchParams<{ service: string }>();
  const info = SERVICE_INFO[service ?? ''] ?? SERVICE_INFO.maintenance;
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></Pressable>
        <Text style={styles.title}>{info.label}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroIcon, { backgroundColor: `${info.color}22` }]}>
          <Ionicons name={info.icon as any} size={42} color={info.color} />
        </View>
        <Text style={styles.heading}>{info.label}</Text>
        <Text style={styles.description}>{info.description}</Text>
        <View style={styles.items}>
          {info.items.map(item => (
            <Pressable key={item} style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}>
              <Text style={styles.itemText}>{item}</Text>
              <Ionicons name="chevron-forward" size={20} color="#7fb5ae" />
            </Pressable>
          ))}
        </View>
        <View style={styles.comingSoon}>
          <Ionicons name="time-outline" size={18} color="#7fb5ae" />
          <Text style={styles.comingSoonText}>More features are coming soon</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  content: { padding: 24, alignItems: 'center', gap: 14 },
  heroIcon: { width: 92, height: 92, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginTop: 6 },
  description: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#7fb5ae', textAlign: 'center', lineHeight: 22, maxWidth: 290 },
  items: { width: '100%', gap: 10, marginTop: 18 },
  item: { backgroundColor: '#0e3b33', borderWidth: 1, borderColor: '#1a5048', borderRadius: 15, padding: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  comingSoon: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  comingSoonText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
});