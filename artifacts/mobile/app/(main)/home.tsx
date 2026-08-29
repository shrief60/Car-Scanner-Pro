import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useCars, Car } from '@/context/CarsContext';

const SERVICES = [
  { id: 'maintenance', label: 'Maintenance', subtitle: 'Keep your car running', icon: 'construct-outline', color: '#4ade80' },
  { id: 'accessories', label: 'Accessories', subtitle: 'Upgrade your drive', icon: 'color-palette-outline', color: '#60a5fa' },
  { id: 'marketplace', label: 'Buy & Sell', subtitle: 'Find your next car', icon: 'swap-horizontal-outline', color: '#fbbf24' },
  { id: 'notifications', label: 'Notifications', subtitle: 'Your Qar updates', icon: 'notifications-outline', color: '#c084fc' },
  { id: 'reminders', label: 'Reminders', subtitle: 'Never miss a date', icon: 'calendar-outline', color: '#fb923c' },
  { id: 'sos', label: 'SOS', subtitle: 'Get help fast', icon: 'alert-circle-outline', color: '#f87171' },
];

function CarCard({ car }: { car: Car }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.carCard, pressed && { opacity: 0.8 }]}
      onPress={() => router.push({
        pathname: '/(main)/qr-display',
        params: {
          id: String(car.id),
          plate: car.plate_number,
          make: car.make ?? '',
          model: car.model ?? '',
          color: car.color ?? '',
          qrCode: car.qr_code,
        },
      })}
    >
      <View style={styles.carIcon}>
        <Ionicons name="car-sport-outline" size={24} color="#7fb5ae" />
      </View>
      <View style={styles.carDetails}>
        <Text style={styles.carPlate}>{car.plate_number}</Text>
        <Text style={styles.carMeta}>
          {[car.make, car.model, car.color].filter(Boolean).join(' · ') || 'View car details'}
        </Text>
      </View>
      <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { phone, username, authMethod, logout } = useAuth();
  const { cars, isLoading, error, fetchCars } = useCars();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const displayName = authMethod === 'password' || authMethod === 'google' ? username : phone;

  useEffect(() => {
    fetchCars();
  }, []);

  function openService(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/(main)/service', params: { service: id } });
  }

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/welcome');
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
            <Pressable style={styles.headerBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#7fb5ae" />
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Cars</Text>
          <Pressable onPress={() => router.push('/(main)/add-car')}>
            <Text style={styles.addText}>+ Add car</Text>
          </Pressable>
        </View>
        {isLoading && cars.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#7fb5ae" />
            <Text style={styles.loadingText}>Loading your cars…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={fetchCars}><Text style={styles.retryText}>Retry</Text></Pressable>
          </View>
        ) : cars.length === 0 ? (
          <Pressable style={styles.emptyCard} onPress={() => router.push('/(main)/add-car')}>
            <Ionicons name="car-outline" size={30} color="#7fb5ae" />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyTitle}>Add your first car</Text>
              <Text style={styles.emptySubtitle}>Create a QR code and stay connected</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          </Pressable>
        ) : (
          <FlatList
            data={cars.slice(0, 3)}
            keyExtractor={car => String(car.id)}
            renderItem={({ item }) => <CarCard car={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.fab, { bottom: botPad + 22 }, pressed && styles.fabPressed]}
        onPress={() => router.push('/(main)/add-car')}
      >
        <Ionicons name="add" size={30} color="#082926" />
      </Pressable>
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
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: { width: '31.9%', minHeight: 112, backgroundColor: '#0e3b33', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#1a5048' },
  serviceIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 9 },
  serviceLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  serviceSubtitle: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3, lineHeight: 13 },
  addText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  loadingBox: { alignItems: 'center', padding: 24, gap: 8 },
  loadingText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  errorText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444' },
  retryText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  emptyCard: { backgroundColor: '#0e3b33', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1a5048' },
  emptyTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  emptySubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 4 },
  carCard: { backgroundColor: '#0e3b33', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1a5048' },
  carIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#082926', justifyContent: 'center', alignItems: 'center' },
  carDetails: { flex: 1 },
  carPlate: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 },
  carMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3 },
  fab: { position: 'absolute', right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8 },
  fabPressed: { transform: [{ scale: 0.94 }] },
});