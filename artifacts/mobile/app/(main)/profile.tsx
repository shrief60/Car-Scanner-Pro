import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '@/components/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCars, Car } from '@/context/CarsContext';
import { useLocale } from '@/context/LocaleContext';
import { getMe, UserProfile } from '@/services/auth';
import { FONT, latinLetterSpacing } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignStart, ltrIsolate } from '@/lib/direction';
import { formatMonthYear } from '@/lib/format';

/** "Shehab Ahmed" -> "SA"; falls back to the first glyph of anything non-empty. */
function initialsOf(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}


function InfoRow({
  icon,
  label,
  value,
  verified,
  ltr,
}: {
  icon: string;
  label: string;
  value?: string | null;
  verified?: boolean;
  /** Pin the value left-to-right — for a phone number, whose leading `+` is
   *  bidi-neutral and jumps to the far end of an Arabic paragraph otherwise. */
  ltr?: boolean;
}) {
  const { t } = useLocale();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon as any} size={18} color="#7fb5ae" />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, alignStart()]}>{label}</Text>
        <Text style={[styles.infoValue, alignStart()]} numberOfLines={1}>
          {(ltr ? ltrIsolate(value) : value) || t('common.notSet')}
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
  const { t } = useLocale();
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
        <Text style={[styles.carPlate, alignStart()]}>{car.plate_number}</Text>
        <Text style={[styles.carMeta, alignStart()]}>
          {[car.make, car.model, car.color].filter(Boolean).join(' · ') || t('profile.viewCarDetails')}
        </Text>
      </View>
      <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { username, email, phone } = useAuth();
  const { t } = useLocale();
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
      setLoadError((e as Error).message || t('profile.couldNotRefresh'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    if (cars.length === 0) fetchCars();
  }, []);

  const name = profile?.name || username || t('profile.fallbackName');
  const shownEmail = profile?.email ?? email;
  const since = formatMonthYear(profile?.created_at);

  // Only the fields that genuinely have nothing cached get a skeleton — the name
  // and email come from the stored session, so they paint straight away.
  const pending = loading && !profile;
  const carsPending = carsLoading && cars.length === 0;

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
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
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
            <Text style={[styles.avatarText, latinLetterSpacing(1)]}>{initialsOf(name)}</Text>
          </LinearGradient>

          <View style={styles.identityText}>
            {pending && !username ? (
              <>
                <Skeleton width={130} height={20} />
                <Skeleton width={180} height={13} style={{ marginTop: 8 }} />
              </>
            ) : (
              <>
                <Text style={[styles.name, alignStart()]} numberOfLines={1}>{name}</Text>
                {!!shownEmail && (
                  <Text style={[styles.email, alignStart()]} numberOfLines={1}>{shownEmail}</Text>
                )}
              </>
            )}
          </View>
        </LinearGradient>

        {!!loadError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text style={[styles.errorText, alignStart()]}>{loadError}</Text>
            <Pressable onPress={loadProfile}>
              <Text style={[styles.retryText, alignStart()]}>{t('common.retry')}</Text>
            </Pressable>
          </View>
        )}

        {/* ── Account ───────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, alignStart()]}>{t('profile.account')}</Text>
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
                label={t('profile.phone')}
                value={profile?.phone ?? phone}
                verified={profile?.phone_verified}
                ltr
              />
              {!!since && (
                <>
                  <View style={styles.divider} />
                  <InfoRow icon="calendar-outline" label={t('profile.memberSince')} value={since} />
                </>
              )}
            </>
          )}
        </View>

        {/* ── My cars ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, alignStart()]}>{t('profile.myCars')}</Text>
          <Pressable onPress={() => router.push('/(main)/add-car')}>
            <Text style={[styles.addText, alignStart()]}>{t('profile.addCar')}</Text>
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
            <Text style={[styles.errorText, alignStart()]}>{carsError}</Text>
            <Pressable onPress={fetchCars}>
              <Text style={[styles.retryText, alignStart()]}>{t('common.retry')}</Text>
            </Pressable>
          </View>
        ) : cars.length === 0 ? (
          <Pressable style={styles.emptyCard} onPress={() => router.push('/(main)/add-car')}>
            <Ionicons name="car-outline" size={30} color="#7fb5ae" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.emptyTitle, alignStart()]}>{t('profile.addFirstCar')}</Text>
              <Text style={[styles.emptySubtitle, alignStart()]}>{t('profile.addFirstCarSubtitle')}</Text>
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

        {/* ── Settings ──────────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.75 }]}
          onPress={() => router.push('/(main)/settings')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.settings')}
        >
          <View style={styles.infoIcon}>
            <Ionicons name="settings-outline" size={18} color="#7fb5ae" />
          </View>
          <Text style={[styles.settingsLabel, alignStart()]}>{t('profile.settings')}</Text>
          <Ionicons name={mirrorIcon('chevron-forward')} size={18} color="#7fb5ae" />
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
  // letterSpacing lives on the element (latinLetterSpacing) — these are user
  // initials and can be Arabic, which must stay cursively joined.
  avatarText: { fontSize: 24, fontFamily: FONT.bold, color: '#FFFFFF' },
  identityText: { flex: 1 },
  name: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF' },
  email: { fontSize: 13, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 3 },

  sectionTitle: { fontSize: 19, fontFamily: FONT.bold, color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  addText: { fontSize: 13, fontFamily: FONT.semibold, color: '#FFFFFF' },

  infoCard: {
    backgroundColor: '#0e3b33', borderRadius: 16,
    borderWidth: 1, borderColor: '#1a5048', paddingHorizontal: 14,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    paddingHorizontal: 14, backgroundColor: '#0e3b33', borderRadius: 16,
    borderWidth: 1, borderColor: '#1a5048',
  },
  infoIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#082926',
    justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae' },
  // Left-aligned like every other row on this screen. The Arabic still shapes and
  // reads right-to-left within itself; forcing textAlign:'right' here only split the
  // row — Arabic hard right, English sub-label hard left, with a gap between them.
  settingsLabel: { flex: 1, fontSize: 15, fontFamily: FONT.medium, color: '#FFFFFF' },
  infoValue: { fontSize: 15, fontFamily: FONT.medium, color: '#FFFFFF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1a5048', marginStart: 50 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { flex: 1, fontSize: 12, fontFamily: FONT.regular, color: '#ef4444' },
  retryText: { fontSize: 12, fontFamily: FONT.semibold, color: '#FFFFFF' },

  emptyCard: {
    backgroundColor: '#0e3b33', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#1a5048',
  },
  emptyTitle: { fontSize: 15, fontFamily: FONT.semibold, color: '#FFFFFF' },
  emptySubtitle: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 4 },

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
  carPlate: { fontSize: 18, fontFamily: FONT.bold, color: '#FFFFFF', letterSpacing: 2 },
  carMeta: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 3 },

});
