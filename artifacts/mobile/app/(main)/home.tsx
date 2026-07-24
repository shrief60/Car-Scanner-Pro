import React, { useEffect } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useCars, Car } from '@/context/CarsContext';

function CarCard({ car }: { car: Car }) {
  function handleViewQR() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(main)/qr-display',
      params: {
        id: String(car.id),
        plate: car.plate_number,
        make: car.make ?? '',
        model: car.model ?? '',
        color: car.color ?? '',
        qrCode: car.qr_code,
      },
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{car.plate_number}</Text>
        </View>
        <View style={styles.cardInfo}>
          {car.make ? <Text style={styles.cardMeta}>{car.make}{car.model ? ` ${car.model}` : ''}</Text> : null}
          {car.color ? <Text style={styles.cardMeta}>{car.color}</Text> : null}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.qrBtn, pressed && { opacity: 0.75 }]}
        onPress={handleViewQR}
      >
        <Ionicons name="qr-code" size={20} color="#082926" />
        <Text style={styles.qrBtnText}>QR</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { phone, username, authMethod, logout } = useAuth();
  const { cars, isLoading, error, fetchCars } = useCars();

  useEffect(() => {
    fetchCars();
  }, []);

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/welcome');
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);
  const displayName = authMethod === 'password' ? username : phone;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.phone}>{displayName}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(main)/scanner');
            }}
          >
            <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#7fb5ae" />
          </Pressable>
        </View>
      </View>

      {/* Logo bar */}
      <View style={styles.logoBar}>
        <Text style={styles.logoText}>Qar</Text>
        <Text style={styles.logoSub}>My Cars</Text>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchCars}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Cars list */}
      {isLoading && cars.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#7fb5ae" />
          <Text style={styles.loadingText}>Loading your cars…</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={c => String(c.id)}
          contentContainerStyle={[styles.list, { paddingBottom: botPad + 100 }]}
          renderItem={({ item }) => <CarCard car={item} />}
          onRefresh={fetchCars}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={64} color="#1a5048" />
              <Text style={styles.emptyTitle}>No cars yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your car and generate a unique QR code for it
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { bottom: botPad + 28 },
          pressed && styles.fabPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(main)/add-car');
        }}
      >
        <Ionicons name="add" size={32} color="#082926" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 12,
  },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  phone: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoBar: {
    paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'baseline', gap: 10,
  },
  logoText: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 },
  logoSub: { fontSize: 16, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', marginHorizontal: 20,
    borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', color: '#ef4444' },
  retryText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  list: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },
  card: {
    backgroundColor: '#0e3b33', borderRadius: 18, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#1a5048',
  },
  cardLeft: { gap: 8 },
  plateBox: {
    backgroundColor: '#082926', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1a5048',
  },
  plateText: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 },
  cardInfo: { gap: 2 },
  cardMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  qrBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', gap: 4,
  },
  qrBtnText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#082926' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF', textAlign: 'center' },
  emptySubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular', color: '#7fb5ae',
    textAlign: 'center', lineHeight: 22, maxWidth: 260,
  },
  fab: {
    position: 'absolute', right: 24, width: 62, height: 62, borderRadius: 31,
    backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabPressed: { transform: [{ scale: 0.94 }] },
});
