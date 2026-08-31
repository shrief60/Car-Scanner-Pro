/**
 * The merchant browsing data layer — **the single seam** between this feature and the
 * backend.
 *
 * Today it serves local fixtures, because the API cannot support the feature: probed
 * against the live server, `GET /api/merchants` is a 404 (route does not exist), there
 * is no cross-merchant item feed, and no merchant profiles are seeded, so even the real
 * `GET /api/merchants/{id}/menu` returns 404 for every id.
 *
 * To go live: implement the endpoints in `.claude/docs/api/merchant-menu.md`, flip
 * `USE_FIXTURES` to false, and delete `merchants.fixtures.ts`. **No screen or hook
 * changes** — that is the whole point of this file, so nothing else may import the
 * fixtures.
 */
import { api } from './api';
import * as fx from './merchants.fixtures';
import type {
  ActivityType,
  Merchant,
  MenuItemWithMerchant,
  MerchantMenu,
  Page,
} from '@/types/merchants';

const USE_FIXTURES = true;

/** Rows per page. Mirrors what the server-side paginator should use. */
export const PAGE_SIZE = 12;

/**
 * Laravel keeps the `{ data, links, meta }` envelope on *paginated* resource
 * collections even under `JsonResource::withoutWrapping()`, but returns a bare array
 * for unpaginated ones (`GET /api/packages` does exactly that). Accept both so the
 * swap does not hinge on which the backend picks.
 */
function toPage<T>(
  res: T[] | { data: T[]; meta?: { current_page: number; last_page: number; total: number } },
  page: number,
): Page<T> {
  if (Array.isArray(res)) return { items: res, nextPage: null, total: res.length };
  const meta = res.meta;
  return {
    items: res.data ?? [],
    nextPage: meta && meta.current_page < meta.last_page ? meta.current_page + 1 : null,
    total: meta?.total ?? null,
  };
}

/** Client-side slice, standing in for the server paginator. */
function paginate<T>(all: T[], page: number): Page<T> {
  const start = (page - 1) * PAGE_SIZE;
  const items = all.slice(start, start + PAGE_SIZE);
  return {
    items,
    nextPage: start + PAGE_SIZE < all.length ? page + 1 : null,
    total: all.length,
  };
}

/**
 * These reads are public — pass `auth = false`. The app has no 401 interceptor, so
 * sending a stale 30-day token would turn a public read into an "Unauthenticated."
 * error box.
 */
export async function listMerchants(params: {
  activityType?: ActivityType;
}): Promise<Merchant[]> {
  if (USE_FIXTURES) return fx.listMerchants(params.activityType);
  const query = params.activityType ? `?activity_type=${params.activityType}` : '';
  const res = await api.get<Merchant[] | { data: Merchant[] }>(`/api/merchants${query}`, false);
  return Array.isArray(res) ? res : res.data ?? [];
}

export async function getMerchantMenu(merchantId: number): Promise<MerchantMenu> {
  if (USE_FIXTURES) return fx.getMerchantMenu(merchantId);
  return api.get<MerchantMenu>(`/api/merchants/${merchantId}/menu`, false);
}

export async function listMenuItems(params: {
  activityType?: ActivityType;
  page?: number;
}): Promise<Page<MenuItemWithMerchant>> {
  const page = params.page ?? 1;

  if (USE_FIXTURES) {
    return paginate(await fx.listMenuItems(params.activityType), page);
  }

  const query = new URLSearchParams({ page: String(page) });
  if (params.activityType) query.set('activity_type', params.activityType);
  const res = await api.get<
    MenuItemWithMerchant[] | { data: MenuItemWithMerchant[]; meta?: any }
  >(`/api/menu-items?${query}`, false);
  return toPage(res, page);
}
