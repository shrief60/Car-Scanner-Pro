import React, { useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorRow } from '@/components/ListStates';
import { MenuItemCard, MenuItemCardSkeleton, LIST_GAP, MENU_ITEM_HEIGHT } from '@/components/MenuItemCard';
import { MerchantCard, MerchantCardSkeleton, MERCHANT_ITEM_HEIGHT } from '@/components/MerchantCard';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { useMenuItemsFeed, useMerchants } from '@/hooks/useMerchants';
import { useLocale } from '@/context/LocaleContext';
import { EMPTY_MENU_KEY } from '@/constants/services';
import type { TranslationKey } from '@/i18n';
import type { ActivityType, Merchant, MenuItemWithMerchant } from '@/types/merchants';
import { FONT } from '@/lib/typography';
import { mirrorIcon } from '@/lib/rtl';
import { alignStart } from '@/lib/direction';

type Tab = 'menu' | 'merchants';

/**
 * The default RefreshControl spinner is dark-on-dark and effectively invisible on
 * #082926 — these colours are required, not decoration.
 */
function refreshControl(refreshing: boolean, onRefresh: () => void) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#7fb5ae"
      colors={['#7fb5ae']}
      progressBackgroundColor="#0e3b33"
    />
  );
}

export function ServiceMenuScreen({
  activity,
  label,
}: {
  activity: ActivityType;
  label: string;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('menu');

  const feed = useMenuItemsFeed(activity);
  const merchants = useMerchants(activity);

  const items = feed.data ?? [];
  const merchantList = merchants.data ?? [];

  const listPad = {
    paddingHorizontal: 20,
    paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 40),
    paddingTop: 4,
  };

  function openItem(row: MenuItemWithMerchant) {
    router.push({
      pathname: '/(main)/menu-item/[itemId]',
      params: {
        itemId: String(row.id),
        merchantId: String(row.merchant.id),
        activity,
      },
    });
  }

  function openMerchant(merchant: Merchant) {
    router.push({
      pathname: '/(main)/merchant/[merchantId]',
      params: { merchantId: String(merchant.id) },
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12) }]}>
      {/* Header and tabs sit OUTSIDE the list: they must not scroll away, must not
          remount on tab switch, and would otherwise offset getItemLayout. */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => router.back()}
        >
          <Ionicons name={mirrorIcon('arrow-back')} size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={[styles.title, alignStart()]}>{label}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabs}>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { value: 'menu', label: t('serviceBrowser.menu') },
            { value: 'merchants', label: t('serviceBrowser.merchants') },
          ]}
        />
      </View>

      {tab === 'menu' ? (
        <FlatList
          data={items}
          // Item ids restart per merchant, so the id alone collides in this feed.
          keyExtractor={row => `${row.merchant.id}:${row.id}`}
          renderItem={({ item }) => (
            <MenuItemCard item={item} merchant={item.merchant} onPress={() => openItem(item)} />
          )}
          getItemLayout={(_, index) => ({
            length: MENU_ITEM_HEIGHT + LIST_GAP,
            offset: (MENU_ITEM_HEIGHT + LIST_GAP) * index,
            index,
          })}
          // Gap via margin rather than a separator, so getItemLayout stays exact.
          ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
          contentContainerStyle={listPad}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          removeClippedSubviews={false}
          refreshControl={refreshControl(feed.isRefetching, feed.refetch)}
          ListHeaderComponent={
            feed.error ? (
              <View style={{ marginBottom: LIST_GAP }}>
                <ErrorRow message={(feed.error as Error).message} onRetry={feed.refetch} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            feed.isPending ? (
              <View style={{ gap: LIST_GAP }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <MenuItemCardSkeleton key={i} />
                ))}
              </View>
            ) : feed.error ? null : (
              <EmptyState
                icon="construct-outline"
                title={t('serviceBrowser.noServicesTitle')}
                subtitle={t((EMPTY_MENU_KEY[activity] ?? 'serviceBrowser.noServicesTitle') as TranslationKey)}
              />
            )
          }
        />
      ) : (
        <FlatList
          data={merchantList}
          keyExtractor={m => String(m.id)}
          renderItem={({ item }) => (
            <MerchantCard merchant={item} onPress={() => openMerchant(item)} />
          )}
          getItemLayout={(_, index) => ({
            length: MERCHANT_ITEM_HEIGHT + LIST_GAP,
            offset: (MERCHANT_ITEM_HEIGHT + LIST_GAP) * index,
            index,
          })}
          ItemSeparatorComponent={() => <View style={{ height: LIST_GAP }} />}
          contentContainerStyle={listPad}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          removeClippedSubviews={false}
          refreshControl={refreshControl(merchants.isRefetching, merchants.refetch)}
          ListHeaderComponent={
            merchants.error ? (
              <View style={{ marginBottom: LIST_GAP }}>
                <ErrorRow
                  message={(merchants.error as Error).message}
                  onRetry={merchants.refetch}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            merchants.isPending ? (
              <View style={{ gap: LIST_GAP }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MerchantCardSkeleton key={i} />
                ))}
              </View>
            ) : merchants.error ? null : (
              <EmptyState
                icon="storefront-outline"
                title={t('serviceBrowser.noShopsTitle')}
                subtitle={t('serviceBrowser.noShopsSubtitle')}
              />
            )
          }
        />
      )}
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
  title: { fontSize: 20, fontFamily: FONT.bold, color: '#FFFFFF' },
  tabs: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
});
