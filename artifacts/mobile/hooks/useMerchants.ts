import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  getMerchantMenu,
  listMenuItems,
  listMerchants,
} from '@/services/merchants';
import type {
  ActivityType,
  MenuItemWithMerchant,
  MerchantMenu,
  Page,
} from '@/types/merchants';

/**
 * Query keys never encode the data source — no `['fixtures', …]`. They stay
 * byte-identical after the fixture→API swap, so the cache needs no clearing and
 * `useMenuItem`'s cache reads keep working.
 */
export const qk = {
  merchants: (activity: ActivityType) => ['merchants', 'list', activity] as const,
  merchantMenu: (merchantId: number) => ['merchants', 'menu', merchantId] as const,
  menuItems: (activity: ActivityType) => ['merchants', 'items', activity] as const,
};

/** Merchants for one service category. Tens of rows — no pagination needed. */
export function useMerchants(activity: ActivityType) {
  return useQuery({
    queryKey: qk.merchants(activity),
    queryFn: () => listMerchants({ activityType: activity }),
  });
}

/**
 * The cross-merchant item feed — the only list that grows unbounded (items ×
 * merchants), so it is the only one that pages.
 */
export function useMenuItemsFeed(activity: ActivityType) {
  return useInfiniteQuery({
    queryKey: qk.menuItems(activity),
    queryFn: ({ pageParam }) => listMenuItems({ activityType: activity, page: pageParam }),
    // Required in react-query v5 — omitting it throws at runtime, not compile time.
    initialPageParam: 1,
    getNextPageParam: (last: Page<MenuItemWithMerchant>) => last.nextPage,
  });
}

/** One merchant's own menu. Capped in size by the product's free-tier item limit. */
export function useMerchantMenu(merchantId: number) {
  return useQuery({
    queryKey: qk.merchantMenu(merchantId),
    queryFn: () => getMerchantMenu(merchantId),
    enabled: Number.isFinite(merchantId),
  });
}

/** Look for an already-loaded copy of the item before hitting the network. */
function findCached(
  client: QueryClient,
  { merchantId, itemId, activity }: { merchantId: number; itemId: number; activity?: ActivityType },
): MenuItemWithMerchant | null {
  const menu = client.getQueryData<MerchantMenu>(qk.merchantMenu(merchantId));
  const fromMenu = menu?.items.find(i => i.id === itemId);
  if (fromMenu && menu) return { ...fromMenu, merchant: menu.merchant };

  if (activity) {
    const feed = client.getQueryData<{ pages: Page<MenuItemWithMerchant>[] }>(
      qk.menuItems(activity),
    );
    for (const page of feed?.pages ?? []) {
      const hit = page.items.find(i => i.id === itemId && i.merchant.id === merchantId);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * Item detail. There is no `GET /api/menu/items/{id}`, so this is cache-first and
 * falls back to refetching the whole merchant menu — which is also what makes a cold
 * deep link work.
 */
export function useMenuItem(params: {
  merchantId: number;
  itemId: number;
  activity?: ActivityType;
}) {
  const client = useQueryClient();
  const seed = findCached(client, params);

  const query = useQuery({
    queryKey: qk.merchantMenu(params.merchantId),
    queryFn: () => getMerchantMenu(params.merchantId),
    // No request at all on the happy path (navigated from a list).
    enabled: !seed && Number.isFinite(params.merchantId),
  });

  const fromFetch = query.data?.items.find(i => i.id === params.itemId);
  const item: MenuItemWithMerchant | null =
    seed ?? (fromFetch && query.data ? { ...fromFetch, merchant: query.data.merchant } : null);

  return {
    item,
    // A *disabled* query reports isPending: true in v5 (fetchStatus is 'idle'), so the
    // `!item` term is load-bearing — without it a cache hit shows a permanent skeleton.
    isPending: !item && query.isPending,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
