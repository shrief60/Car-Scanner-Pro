import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Skeleton } from '@/components/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCars, Car } from '@/context/CarsContext';
import { getMe, UserProfile } from '@/services/auth';
import { LegalSlug } from '@/constants/legal';

/** "Shehab Ahmed" -> "SA"; falls back to the first glyph of anything non-empty. */
function initialsOf(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function memberSince(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function InfoRow({
  icon,
  label,
  value,
  verified,
}: {
  icon: string;
  label: string;
  value?: string | null;
  verified?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color="#7fb5ae" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value || 'Not set'}
        </Text>
      </View>
      {verified && <Ionicons name="checkmark-circle" size={19} color="#4ade80" />}
    </View>
  );
}

function InfoRowSkeleton() {
  return (
    <View style={styles.infoRow}>
      <Skeleton width={38} height={38} radius={12} />
      <View style={styles.infoText}>
        <Skeleton width={64} height={11} />
        <Skeleton width={150} height={15} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

/** A tappable policy row. Arabic title with an English sub-label, matching the docs. */
function LegalRow({
  icon,
  label,
  sublabel,
  doc,
}: {
  icon: string;
  label: string;
  sublabel: string;
  doc: LegalSlug;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.infoRow, pressed && { opacity: 0.75 }]}
      onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc } })}
      accessibilityRole="button"
      accessibilityLabel={sublabel}
    >
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color="#7fb5ae" />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.legalLabel}>{label}</Text>
        <Text style={styles.infoLabel}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#7fb5ae" />
    </Pressable>
  );
}

function CarCardSkeleton() {
  return (
    <View style={styles.carCard}>
      <Skeleton width={46} height={46} radius={14} />
      <View style={styles.carDetails}>
        <Skeleton width={120} height={17} />
        <Skeleton width={170} height={12} style={{ marginTop: 7 }} />
      </View>
    </View>
  );
}

function CarCard({ car }: { car: Car }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.carCard, pressed && { opacity: 0.8 }]}
      onPress={() =>
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
        })
      }
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

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { username, email, phone, logout } = useAuth();
  const { cars, isLoading: carsLoading, error: carsError, fetchCars } = useCars();

  // Render the cached session immediately, then enrich from /api/auth/me.
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 16);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 40);

  async function loadProfile() {
    setLoadError('');
    setLoading(true);
    try {
      setProfile(await getMe());
    } catch (e: unknown) {
      setLoadError((e as Error).message || 'Could not refresh your profile');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    if (cars.length === 0) fetchCars();
  }, []);

  const name = profile?.name || username || 'Qar driver';
  const shownEmail = profile?.email ?? email;
  const since = memberSince(profile?.created_at);

  // Only the fields that genuinely have nothing cached get a skeleton — the name
  // and email come from the stored session, so they paint straight away.
  const pending = loading && !profile;
  const carsPending = carsLoading && cars.length === 0;

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace('/(auth)/welcome');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* ── Identity ──────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#124038', '#0e3b33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.identityCard}
        >
          <LinearGradient
            colors={['#1e6b60', '#16433B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initialsOf(name)}</Text>
          </LinearGradient>

          <View style={styles.identityText}>
            {pending && !username ? (
              <>
                <Skeleton width={130} height={20} />
                <Skeleton width={180} height={13} style={{ marginTop: 8 }} />
              </>
            ) : (
              <>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                {!!shownEmail && (
                  <Text style={styles.email} numberOfLines={1}>{shownEmail}</Text>
                )}
              </>
            )}
          </View>
        </LinearGradient>

        {!!loadError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable onPress={loadProfile}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* ── Account ───────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          {pending ? (
            <>
              <InfoRowSkeleton />
              <View style={styles.divider} />
              <InfoRowSkeleton />
            </>
          ) : (
            <>
              <InfoRow
                icon="call-outline"
                label="Phone"
                value={profile?.phone ?? phone}
                verified={profile?.phone_verified}
              />
              {!!since && (
                <>
                  <View style={styles.divider} />
                  <InfoRow icon="calendar-outline" label="Member since" value={since} />
                </>
              )}
            </>
          )}
        </View>

        {/* ── My cars ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Cars</Text>
          <Pressable onPress={() => router.push('/(main)/add-car')}>
            <Text style={styles.addText}>+ Add car</Text>
          </Pressable>
        </View>

        {carsPending ? (
          <View style={{ gap: 10 }}>
            <CarCardSkeleton />
            <CarCardSkeleton />
          </View>
        ) : carsError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{carsError}</Text>
            <Pressable onPress={fetchCars}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
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
          <View style={{ gap: 10 }}>
            {cars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </View>
        )}

        {/* ── Legal ────────────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.infoCard}>
          <LegalRow
            icon="shield-checkmark-outline"
            label="سياسة الخصوصية"
            sublabel="Privacy Policy"
            doc="privacy"
          />
          <View style={styles.divider} />
          <LegalRow
            icon="card-outline"
            label="سياسة الاسترداد"
            sublabel="Refund Policy"
            doc="refund"
          />
          <View style={styles.divider} />
          <LegalRow
            icon="document-text-outline"
            label="شروط الاستخدام"
            sublabel="Terms of Use"
            doc="terms"
          />
        </View>

        {/* ── Sign out ──────────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  content: { paddingHorizontal: 20, gap: 18 },

  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start',
  },

  identityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#1a5048',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#1a5048',
  },
  avatarText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 1 },
  identityText: { flex: 1 },
  name: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  email: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3 },

  sectionTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  addText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },

  infoCard: {
    backgroundColor: '#0e3b33', borderRadius: 16,
    borderWidth: 1, borderColor: '#1a5048', paddingHorizontal: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  infoIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#082926',
    justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  // Left-aligned like every other row on this screen. The Arabic still shapes and
  // reads right-to-left within itself; forcing textAlign:'right' here only split the
  // row — Arabic hard right, English sub-label hard left, with a gap between them.
  legalLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  infoValue: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#FFFFFF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1a5048', marginLeft: 50 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', color: '#ef4444' },
  retryText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },

  emptyCard: {
    backgroundColor: '#0e3b33', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#1a5048',
  },
  emptyTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  emptySubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 4 },

  carCard: {
    backgroundColor: '#0e3b33', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#1a5048',
  },
  carIcon: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: '#082926',
    justifyContent: 'center', alignItems: 'center',
  },
  carDetails: { flex: 1 },
  carPlate: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF', letterSpacing: 2 },
  carMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3 },

  logoutBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, paddingVertical: 16,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', marginTop: 4,
  },
  logoutPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  logoutText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#ef4444' },
});
