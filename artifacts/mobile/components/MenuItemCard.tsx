import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components/RemoteImage';
import { Skeleton } from '@/components/Skeleton';
import { formatDuration, formatPrice } from '@/lib/format';
import type { MenuItem, MerchantRef } from '@/types/merchants';

/**
 * Fixed height, on purpose — it is what makes `getItemLayout` possible on the list.
 * Every text node is clamped with `numberOfLines` so nothing can reflow it.
 * 88 thumbnail + 14 padding top and bottom.
 */
export const MENU_ITEM_HEIGHT = 116;
export const LIST_GAP = 10;

const THUMB = 88;

export function MenuItemCard({
  item,
  merchant,
  onPress,
}: {
  item: MenuItem;
  /** Omitted on a single merchant's own menu, where the shop is already the header. */
  merchant?: MerchantRef;
  onPress: () => void;
}) {
  const duration = formatDuration(item.duration_minutes);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        !item.is_available && styles.cardDisabled,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${formatPrice(item.price, item.currency)}`}
    >
      <RemoteImage
        uri={item.image_url}
        size={THUMB}
        radius={12}
        icon="construct-outline"
        recyclingKey={`${merchant?.id ?? 'menu'}:${item.id}`}
      />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        {merchant ? (
          <View style={styles.metaRow}>
            <Ionicons name="storefront-outline" size={12} color="#7fb5ae" />
            <Text style={styles.merchant} numberOfLines={1}>
              {merchant.shop_name}
            </Text>
          </View>
        ) : (
          <Text style={styles.merchant} numberOfLines={1}>
            {item.category ?? 'Service'}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(item.price, item.currency)}
          </Text>
          {!item.is_available ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>Unavailable</Text>
            </View>
          ) : duration ? (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={12} color="#7fb5ae" />
              <Text style={styles.duration}>{duration}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

/** Same container and geometry as the real card, so nothing shifts when data lands. */
export function MenuItemCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={THUMB} height={THUMB} radius={12} />
      <View style={styles.body}>
        <Skeleton width="82%" height={15} />
        <Skeleton width="55%" height={12} style={{ marginTop: 9 }} />
        <Skeleton width="38%" height={14} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: MENU_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  cardDisabled: { opacity: 0.55 },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  body: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  merchant: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3, flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  price: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#4ade80' },
  duration: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#7fb5ae' },
  pill: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: { fontSize: 10, fontFamily: 'Inter_500Medium', color: '#ef4444' },
});
