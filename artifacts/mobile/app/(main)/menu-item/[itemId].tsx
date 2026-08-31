import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ErrorRow } from '@/components/ListStates';
import { RemoteImage } from '@/components/RemoteImage';
import { Skeleton } from '@/components/Skeleton';
import { useMenuItem } from '@/hooks/useMerchants';
import { formatDuration, formatPrice } from '@/lib/format';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { useLocale } from '@/context/LocaleContext';
import { alignStart } from '@/lib/direction';

/**
 * Item detail.
 *
 * There is no `GET /api/menu/items/{id}`, so this paints from the react-query cache
 * populated by whichever list you arrived from, and only falls back to fetching the
 * merchant's whole menu on a cold deep link.
 */
export default function MenuItemScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const params = useLocalSearchParams<{ itemId: string; merchantId: string; activity?: string }>();
  // Coerce at the boundary — params are strings, query keys are numbers.
  const itemId = Number(params.itemId);
  const merchantId = Number(params.merchantId);

  const { item, isPending, isError, refetch } = useMenuItem({ itemId, merchantId });

  const duration = formatDuration(item?.duration_minutes ?? null);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {isPending ? (
            <Skeleton width="100%" height={260} radius={0} />
          ) : (
            <RemoteImage
              uri={item?.image_url}
              size={260}
              radius={0}
              icon="construct-outline"
              style={styles.heroImage}
            />
          )}
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              { top: insets.top + (Platform.OS === 'web' ? 67 : 12) },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.body}>
          {isError && !item ? (
            <ErrorRow message={t('serviceBrowser.shopUnavailable')} onRetry={refetch} />
          ) : isPending ? (
            <>
              <Skeleton width="75%" height={26} />
              <Skeleton width="40%" height={18} style={{ marginTop: 12 }} />
              <Skeleton width="100%" height={14} style={{ marginTop: 22 }} />
              <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
              <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
            </>
          ) : item ? (
            <>
              <View style={styles.titleRow}>
                <Text style={[styles.name, alignStart()]}>{item.name}</Text>
                {!item.is_available && (
                  <View style={styles.pill}>
                    <Text style={[styles.pillText, alignStart()]}>{t('serviceBrowser.unavailable')}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.price, alignStart()]}>{formatPrice(item.price, item.currency)}</Text>

              <View style={styles.chips}>
                {!!item.category && (
                  <View style={styles.chip}>
                    <Ionicons name="pricetag-outline" size={13} color="#7fb5ae" />
                    <Text style={[styles.chipText, alignStart()]}>{item.category}</Text>
                  </View>
                )}
                {!!duration && (
                  <View style={styles.chip}>
                    <Ionicons name="time-outline" size={13} color="#7fb5ae" />
                    <Text style={[styles.chipText, alignStart()]}>{duration}</Text>
                  </View>
                )}
              </View>

              {!!item.description && <Text style={[styles.description, alignStart()]}>{item.description}</Text>}

              <Pressable
                style={({ pressed }) => [styles.shopRow, pressed && { opacity: 0.8 }]}
                onPress={() =>
                  router.push({
                    pathname: '/(main)/merchant/[merchantId]',
                    params: { merchantId: String(item.merchant.id) },
                  })
                }
              >
                <View style={styles.shopIcon}>
                  <Ionicons name="storefront-outline" size={22} color="#7fb5ae" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shopName, alignStart()]} numberOfLines={1}>
                    {item.merchant.shop_name}
                  </Text>
                  <Text style={[styles.shopMeta, alignStart()]}>
                    {item.merchant.activity_type_label} · {t('serviceBrowser.viewAllServices')}
                  </Text>
                </View>
                <Ionicons name={mirrorIcon('chevron-forward')} size={20} color="#7fb5ae" />
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  hero: { height: 260, backgroundColor: '#0e3b33' },
  heroImage: { width: '100%', height: 260, borderWidth: 0, borderRadius: 0 },
  backBtn: {
    position: 'absolute',
    start: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(8,41,38,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { padding: 20, gap: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontSize: 24, fontFamily: FONT.bold, color: '#FFFFFF' },
  price: { fontSize: 20, fontFamily: FONT.bold, color: '#4ade80', marginTop: 8 },
  chips: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontFamily: FONT.medium, color: '#7fb5ae' },
  description: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#7fb5ae',
    lineHeight: 22,
    marginTop: 18,
  },
  pill: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontFamily: FONT.medium, color: '#ef4444' },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 14,
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  shopIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#082926',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: { fontSize: 15, fontFamily: FONT.semibold, color: '#FFFFFF' },
  shopMeta: { fontSize: 12, fontFamily: FONT.regular, color: '#7fb5ae', marginTop: 3 },
});
