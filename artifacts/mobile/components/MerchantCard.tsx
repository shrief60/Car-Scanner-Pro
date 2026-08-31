import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '@/components/RemoteImage';
import { Skeleton } from '@/components/Skeleton';
import { humanizeActivity } from '@/lib/format';
import type { Merchant } from '@/types/merchants';

/** Fixed height so the merchants list can use `getItemLayout` too. 56 logo + 14×2. */
export const MERCHANT_ITEM_HEIGHT = 84;

const LOGO = 56;

export function MerchantCard({ merchant, onPress }: { merchant: Merchant; onPress: () => void }) {
  const subtitle = [
    humanizeActivity(merchant.activity_type),
    merchant.items_count != null ? `${merchant.items_count} services` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={merchant.shop_name}
    >
      <RemoteImage
        uri={merchant.logo_url}
        size={LOGO}
        radius={14}
        icon="storefront-outline"
        recyclingKey={`merchant:${merchant.id}`}
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {merchant.shop_name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#7fb5ae" />
    </Pressable>
  );
}

export function MerchantCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={LOGO} height={LOGO} radius={14} />
      <View style={styles.body}>
        <Skeleton width="70%" height={15} />
        <Skeleton width="45%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: MERCHANT_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#0e3b33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  body: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#FFFFFF' },
  meta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3 },
});
