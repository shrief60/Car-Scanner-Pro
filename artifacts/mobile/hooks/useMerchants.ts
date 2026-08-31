import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { getMerchantMenu, listMenuItems, listMerchants } from '@/services/merchants';
import type {
  ActivityType,
  Merchant,
  MenuItemWithMerchant,
  MerchantMenu,
} from '@/types/merchants';

/**
 * Both list endpoints return every category in one unpaginated array and ignore an
 * `activity_type` query param, so the category filter lives here, in `select`. Keeping
 * it in `select` rather than the queryFn means all categories share one cached fetch and
 * switching tabs costs nothing.
 */
export const qk = {
  merchants: () => ['merchants', 'list'] as const,
  merchantMenu: (merchantId: number) => ['merchants', 'menu', merchantId] as const,
  menuItems: () => ['merchants', 'items'] as const,
};

/** Merchants for one service category. */
export function useMerchants(activity: ActivityType) {
  return useQuery({
    queryKey: qk.merchants(),
    queryFn: listMerchants,
    select: (all: Merchant[]) => all.filter(m => m.activity_type === activity),
  });
}

/** The cross-merchant item feed for one category. */
export function useMenuItemsFeed(activity: ActivityType) {
  return useQuery({
    queryKey: qk.menuItems(),
    queryFn: listMenuItems,
    select: (all: MenuItemWithMerchant[]) =>
      all.filter(i => i.merchant.activity_type === activity),
  });
}

/** One merchant's own menu. */
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
  { merchantId, itemId }: { merchantId: number; itemId: number },
): MenuItemWithMerchant | null {
  const menu = client.getQueryData<MerchantMenu>(qk.merchantMenu(merchantId));
  const fromMenu = menu?.items.find(i => i.id === itemId);
  if (fromMenu && menu) return { ...fromMenu, merchant: menu.merchant };

  // The feed is cached unfiltered, so one lookup covers every category.
  const feed = client.getQueryData<MenuItemWithMerchant[]>(qk.menuItems());
  return feed?.find(i => i.id === itemId && i.merchant.id === merchantId) ?? null;
}

/**
 * Item detail. There is no `GET /api/menu/items/{id}`, so this is cache-first and falls
 * back to refetching the whole merchant menu — which is also what makes a cold deep link
 * work.
 */
export function useMenuItem(params: { merchantId: number; itemId: number }) {
  const client = useQueryClient();
  const seed = findCached(client, params);

  const query = useQuery({
    queryKey: qk.merchantMenu(params.merchantId),
    queryFn: () => getMerchantMenu(params.merchantId),
    // No request at all on the happy path (navigated from a list).
    enabled: !seed && Number.isFinite(params.merchantId),
  });

  const fetched = query.data?.items.find(i => i.id === params.itemId);
  const item: MenuItemWithMerchant | null =
    seed ?? (fetched && query.data ? { ...fetched, merchant: query.data.merchant } : null);

  return { item, isPending: !seed && query.isPending, isError: query.isError, refetch: query.refetch };
}
