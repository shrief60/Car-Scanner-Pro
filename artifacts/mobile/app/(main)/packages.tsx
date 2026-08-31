import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { Skeleton } from '@/components/Skeleton';
import { useLocale } from '@/context/LocaleContext';
import { usePackages, useSubscribe } from '@/hooks/usePackages';
import { alignStart } from '@/lib/direction';
import { formatPrice } from '@/lib/format';
import { FONT } from '@/lib/typography';
import type { Package, PaymentMethod } from '@/types/subscriptions';
import type { TranslationKey } from '@/i18n';

/**
 * The step between creating an account and reaching Home.
 *
 * Lives under `(main)` rather than `(auth)`: by the time it renders the account exists
 * and the token is set, so Android back must land on Home — backing into the register
 * screen with a live session would be broken. Both entry points use `router.replace`,
 * so there is nothing behind it either way.
 *
 * `Skip for now` needs no persisted flag: `app/index.tsx` sends an authenticated user
 * straight to Home, so this screen is only ever reachable from the signup flow.
 */

const METHODS: { value: PaymentMethod; label: TranslationKey; hint: TranslationKey; icon: string }[] = [
  { value: 'cash', label: 'packages.cash', hint: 'packages.cashHint', icon: 'cash-outline' },
  { value: 'paymob', label: 'packages.online', hint: 'packages.onlineHint', icon: 'card-outline' },
];

function PackageCard({
  pkg,
  selected,
  best,
  onPress,
}: {
  pkg: Package;
  selected: boolean;
  best: boolean;
  onPress: () => void;
}) {
  const { t } = useLocale();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <Ionicons name="checkmark" size={14} color="#082926" />}
      </View>

      <View style={styles.cardBody}>
        {/* `name` and `description` come from the API and stay as the server sends them
            — only app copy is translated. The cadence below is ours, keyed off `period`. */}
        <View style={styles.nameRow}>
          <Text style={[styles.cardName, alignStart()]} numberOfLines={1}>
            {pkg.name}
          </Text>
          {best && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('packages.bestValue')}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardDesc, alignStart()]} numberOfLines={2}>
          {pkg.description}
        </Text>
      </View>

      <View style={styles.priceCol}>
        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(pkg.price, pkg.currency)}
        </Text>
        {/* Straight off the response — the API renders this label itself. */}
        <Text style={styles.cadence} numberOfLines={1}>
          {pkg.period_label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PackagesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const { data: packages, isPending, isError, refetch } = usePackages();
  const subscribeMutation = useSubscribe();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [error, setError] = useState('');

  // The longest plan carries the badge. `duration_months` is a number, so this needs no
  // arithmetic on `price`, which is a string and must never be parsed.
  const bestId = useMemo(() => {
    if (!packages?.length) return null;
    return packages.reduce((a, b) => (b.duration_months > a.duration_months ? b : a)).id;
  }, [packages]);

  const goHome = useCallback(() => {
    router.replace('/(main)/home');
  }, []);

  // Hardware back goes to Home, same as Skip. `router.replace` does not guarantee the
  // auth screens are off the stack, and backing into Welcome with a live session would
  // show a login screen to someone already signed in. Handling it here means the stack
  // shape stops mattering.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  async function onContinue() {
    if (selectedId == null) return;
    setError('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await subscribeMutation.mutateAsync({
        packageId: selectedId,
        paymentMethod: method,
      });
      // Both methods come back `pending` — that is the API's model, not a gap. Paymob
      // additionally hands us a hosted checkout to open; there is no completion callback
      // to wait for, so either way the next stop is Home.
      if (res.payment.requires_redirect && res.payment.checkout_url) {
        try {
          await Linking.openURL(res.payment.checkout_url);
        } catch {
          // The subscription exists regardless; the message below explains its state, so
          // a browser that will not open must not swallow the whole outcome.
        }
      }
      // `payment.message` is server-authored and already user-facing ("activated once
      // your cash payment is confirmed"), which is the only thing telling a cash user
      // that anything happened — Home looks identical whether they subscribed or skipped.
      Alert.alert(t('packages.done'), res.payment.message, [
        { text: t('common.ok'), onPress: goHome },
      ]);
    } catch (e) {
      setError((e as Error).message || t('packages.subscribeFailed'));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <LinearGradient
      colors={['#082926', '#16433B', '#082926']}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 24),
            paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, alignStart()]}>{t('packages.title')}</Text>
          <Text style={[styles.subtitle, alignStart()]}>{t('packages.subtitle')}</Text>
        </View>

        {isPending ? (
          <View style={styles.list}>
            {[0, 1, 2].map(i => (
              <View key={i} style={styles.cardSkeleton}>
                <Skeleton width={22} height={22} radius={11} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skeleton width={110} height={16} />
                  <Skeleton width="70%" height={12} />
                </View>
                <Skeleton width={72} height={18} />
              </View>
            ))}
          </View>
        ) : isError ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={[styles.errorText, alignStart()]}>{t('packages.loadFailed')}</Text>
            <Pressable onPress={() => refetch()} hitSlop={8}>
              <Text style={styles.retry}>{t('common.retry')}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {packages!.map(pkg => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  selected={selectedId === pkg.id}
                  best={pkg.id === bestId}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedId(pkg.id);
                    setError('');
                  }}
                />
              ))}
            </View>

            <View style={styles.methodBlock}>
              <Text style={[styles.methodLabel, alignStart()]}>
                {t('packages.paymentMethod')}
              </Text>
              <View style={styles.methodRow}>
                {METHODS.map(m => {
                  const on = method === m.value;
                  return (
                    <Pressable
                      key={m.value}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setMethod(m.value);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      style={({ pressed }) => [
                        styles.method,
                        on && styles.methodOn,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Ionicons
                        name={m.icon as never}
                        size={20}
                        color={on ? '#4ade80' : '#7fb5ae'}
                      />
                      <Text style={[styles.methodName, on && styles.methodNameOn]}>
                        {t(m.label)}
                      </Text>
                      <Text style={styles.methodHint}>{t(m.hint)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={[styles.errorText, alignStart()]}>{error}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={onContinue}
            disabled={selectedId == null || subscribeMutation.isPending}
            style={({ pressed }) => [
              styles.button,
              (selectedId == null || subscribeMutation.isPending) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
          >
            {subscribeMutation.isPending ? (
              <ActivityIndicator color="#082926" />
            ) : (
              <Text style={styles.buttonText}>{t('packages.continue')}</Text>
            )}
          </Pressable>

          <Pressable onPress={goHome} hitSlop={10} style={styles.skip}>
            <Text style={styles.skipText}>{t('packages.skip')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 28, gap: 28 },
  header: { gap: 6 },
  title: { fontSize: 32, fontFamily: FONT.bold, color: '#FFFFFF' },
  subtitle: { fontSize: 15, fontFamily: FONT.regular, color: '#7fb5ae', lineHeight: 22 },

  list: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
    padding: 16,
  },
  cardSelected: { borderColor: '#4ade80' },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
    padding: 16,
  },
  // Inline beside the name rather than absolutely positioned: pinned to the card's top
  // edge it collided with the price column, and it collided on whichever side `end`
  // resolved to, so mirroring was not the fix.
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontFamily: FONT.bold, color: '#082926' },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1a5048',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOn: { backgroundColor: '#4ade80', borderColor: '#4ade80' },

  cardBody: { flex: 1, gap: 3 },
  // flexShrink so a long plan name ellipsises instead of being clipped mid-glyph.
  cardName: { flexShrink: 1, fontSize: 17, fontFamily: FONT.semibold, color: '#FFFFFF' },
  cardDesc: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', lineHeight: 17 },

  // flexShrink: 0 — the cadence ('every 6 months') is the widest thing in this
  // column; letting it shrink wrapped the price onto a second line and clipped it,
  // which then squeezed the name beside it. Only visible in English.
  priceCol: { flexShrink: 0, alignItems: 'flex-end', gap: 2 },
  price: { fontSize: 16, fontFamily: FONT.bold, color: '#FFFFFF' },
  cadence: { fontSize: 11, fontFamily: FONT.regular, color: '#7fb5ae' },

  methodBlock: { gap: 10 },
  methodLabel: { fontSize: 14, fontFamily: FONT.medium, color: '#7fb5ae' },
  methodRow: { flexDirection: 'row', gap: 12 },
  method: {
    flex: 1,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a5048',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  methodOn: { borderColor: '#4ade80' },
  methodName: { fontSize: 15, fontFamily: FONT.semibold, color: '#7fb5ae' },
  methodNameOn: { color: '#FFFFFF' },
  methodHint: { fontSize: 11, fontFamily: FONT.regular, color: '#4a8a82' },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: FONT.regular, color: '#ef4444' },
  retry: { fontSize: 13, fontFamily: FONT.semibold, color: '#ef4444' },

  footer: { marginTop: 'auto', gap: 14 },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.35 },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: 17, fontFamily: FONT.bold, color: '#082926' },

  skip: { alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12 },
  skipText: { fontSize: 15, fontFamily: FONT.medium, color: '#7fb5ae' },
});
