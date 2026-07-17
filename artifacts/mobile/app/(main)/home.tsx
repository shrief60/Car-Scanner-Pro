import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
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
      params: { id: car.id, plate: car.plate, type: car.type, color: car.color },
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.plateBox}>
          <Text style={styles.plateText}>{car.plate}</Text>
        </View>
        <View style={styles.cardInfo}>
          {car.type ? (
            <Text style={styles.cardMeta}>{car.type}</Text>
          ) : null}
          {car.color ? (
            <Text style={styles.cardMeta}>{car.color}</Text>
          ) : null}
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
  const { phone, logout } = useAuth();
  const { cars, isLoading } = useCars();

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/phone');
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>أهلاً بك</Text>
          <Text style={styles.phone}>{phone}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(main)/scanner');
            }}
          >
            <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#7fb5ae" />
          </Pressable>
        </View>
      </View>

      {/* Logo bar */}
      <View style={styles.logoBar}>
        <Text style={styles.logoText}>قار</Text>
        <Text style={styles.logoSub}>سياراتي</Text>
      </View>

      {/* Cars list */}
      <FlatList
        data={cars}
        keyExtractor={c => c.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: botPad + 100 },
        ]}
        scrollEnabled={cars.length > 0}
        renderItem={({ item }) => <CarCard car={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={64} color="#1a5048" />
              <Text style={styles.emptyTitle}>لا توجد سيارات بعد</Text>
              <Text style={styles.emptySubtitle}>
                أضف سيارتك وأنشئ كود QR خاص بها
              </Text>
            </View>
          ) : null
        }
      />

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  phone: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  logoText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 12,
  },
  card: {
    backgroundColor: '#0e3b33',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  cardLeft: { gap: 8 },
  plateBox: {
    backgroundColor: '#082926',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  plateText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  cardInfo: { gap: 2 },
  cardMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
  },
  qrBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  qrBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#082926',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#7fb5ae',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: { transform: [{ scale: 0.94 }] },
});
