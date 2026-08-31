import React from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorRow } from '@/components/ListStates';
import { MenuItemCard, MenuItemCardSkeleton, LIST_GAP, MENU_ITEM_HEIGHT } from '@/components/MenuItemCard';
import { RemoteImage } from '@/components/RemoteImage';
import { Skeleton } from '@/components/Skeleton';
import { useMerchantMenu } from '@/hooks/useMerchants';
import { humanizeActivity } from '@/lib/format';
import type { MenuItem } from '@/types/merchants';

export default function MerchantMenuScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ merchantId: string }>();
  // Params arrive as strings; the query key is numeric. A string here would miss the
  // cache silently and refetch instead of painting instantly.
  const merchantId = Number(params.merchantId);

  const { data, isPending, error, refetch, isRefetching } = useMerchantMenu(merchantId);
  const items = data?.items ?? [];

  function openItem(item: MenuItem) {
    router.push({
      pathname: '/(main)/menu-item/[itemId]',
      params: { itemId: String(item.id), merchantId: String(merchantId) },
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {data?.merchant.shop_name ?? 'Shop'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.shopCard}>
        {isPending ? (
          <>
            <Skeleton width={64} height={64} radius={16} />
            <View style={{ flex: 1 }}>
              <Skeleton width="70%" height={17} />
              <Skeleton width="45%" height={12} style={{ marginTop: 8 }} />
            </View>
          </>
        ) : (
          <>
            <RemoteImage uri={null} size={64} radius={16} icon="storefront-outline" />
            <View style={{ flex: 1 }}>
              <Text style={styles.shopName} numberOfLines={1}>
                {data?.merchant.shop_name}
              </Text>
              <Text style={styles.shopMeta} numberOfLines={1}>
                {data ? humanizeActivity(data.merchant.activity_type) : ''}
                {items.length ? ` · ${items.length} services` : ''}
              </Text>
            </View>
          </>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        // No merchant prop — the shop is already the header of this screen.
        renderItem={({ item }) => <MenuItemCard item={item} onPress={() => openItem(item)} />}
        getItemLayout={(_, index) => ({
          length: MENU_ITEM_HEIGHT + LIST_GAP,
          offset: (MENU_ITEM_HEIGHT + LIST_GAP) * index,
          index,
        })}
        ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#7fb5ae"
            colors={['#7fb5ae']}
            progressBackgroundColor="#0e3b33"
          />
        }
        ListHeaderComponent={
          error ? (
            <View style={{ marginBottom: LIST_GAP }}>
              <ErrorRow message={(error as Error).message} onRetry={refetch} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isPending ? (
            <View style={{ gap: LIST_GAP }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <MenuItemCardSkeleton key={i} />
              ))}
            </View>
          ) : error ? null : (
            <EmptyState
              icon="construct-outline"
              title="No services listed"
              subtitle="This shop hasn't published its menu yet."
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#082926' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#0e3b33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a5048',
  },
  shopName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  shopMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#7fb5ae', marginTop: 3 },
});
