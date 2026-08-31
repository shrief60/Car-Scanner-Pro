/**
 * Shapes for the merchant / menu browsing flow.
 *
 * `MerchantMenu` mirrors `GET /api/merchants/{merchantId}/menu` verbatim — it is the
 * one endpoint that actually exists. Everything else is specced in
 * `.claude/docs/api/merchant-menu.md` and served from fixtures until it ships.
 */

export type ActivityType =
  | 'car_wash'
  | 'maintenance'
  | 'fuel_station'
  | 'accessories'
  | 'other';

/** Exactly the nested `merchant` object the live menu endpoint returns. */
export interface MerchantRef {
  id: number;
  shop_name: string;
  activity_type: ActivityType;
}

export interface Merchant extends MerchantRef {
  logo_url?: string | null;
  address?: string | null;
  items_count?: number | null;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  /** A STRING, e.g. "175.00". Never round-trip through Number for display. */
  price: string;
  /** Separate from price, e.g. "EGP". */
  currency: string;
  image_url: string | null;
  category: string | null;
  duration_minutes: number | null;
  is_available: boolean;
  sort_order: number;
}

/** Verbatim mirror of GET /api/merchants/{merchantId}/menu. */
export interface MerchantMenu {
  id: number;
  title: string | null;
  description: string | null;
  is_published: boolean;
  merchant: MerchantRef;
  items: MenuItem[];
}

/**
 * A row in the cross-merchant feed. The merchant is embedded **per item** so a card
 * can name its shop without a second lookup — the spec requires the real endpoint to
 * do the same, which is what keeps the fixture→API swap to one file.
 */
export interface MenuItemWithMerchant extends MenuItem {
  merchant: MerchantRef;
}

export interface Page<T> {
  items: T[];
  /** null when there is nothing more to load. */
  nextPage: number | null;
  total: number | null;
}
