/**
 * Merchant browsing — straight passthroughs to the API.
 *
 * These used to be served from `merchants.fixtures.ts` because the endpoints did not
 * exist. They do now, so the fixtures and the shape-adapting layer around them are gone:
 * each function returns exactly what the server sent.
 *
 * Two things the endpoints do NOT do, both verified against the live server:
 *
 * - **No `activity_type` filter.** `GET /api/merchants?activity_type=maintenance` returns
 *   the same 15 rows as the unfiltered call, so the category filter is applied
 *   client-side in `hooks/useMerchants.ts`.
 * - **No pagination.** Both list endpoints return a bare JSON array (15 merchants, 10
 *   items today), so there is no page cursor to follow.
 *
 * They are also **authenticated** — an unauthenticated call is a 401, not a public read.
 */
import { api } from './api';
import type { Merchant, MenuItemWithMerchant, MerchantMenu } from '@/types/merchants';

export function listMerchants(): Promise<Merchant[]> {
  return api.get<Merchant[]>('/api/merchants');
}

export function listMenuItems(): Promise<MenuItemWithMerchant[]> {
  return api.get<MenuItemWithMerchant[]>('/api/menu-items');
}

export function getMerchantMenu(merchantId: number): Promise<MerchantMenu> {
  return api.get<MerchantMenu>(`/api/merchants/${merchantId}/menu`);
}
