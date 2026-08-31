/**
 * Shapes for the merchant / menu browsing flow.
 *
 * Every field here is a key the API actually returns — see
 * `.claude/docs/api/merchant-menu.md`, regenerated from the Postman export. Nothing is
 * renamed or reshaped on the way in: the screens read `shop_photo_url`,
 * `activity_type_label` and so on directly off the response.
 */

/** The server's own enum. Note `gas_station` — not `fuel_station`. */
export type ActivityType =
  | 'car_wash'
  | 'maintenance'
  | 'gas_station'
  | 'accessories'
  | 'other';

/** The trimmed merchant the API nests inside a menu and inside each feed item. */
export interface MerchantRef {
  id: number;
  shop_name: string;
  activity_type: ActivityType;
  /** Display-ready, localised by the server. Render this, don't derive one. */
  activity_type_label: string;
}

/** A row of `GET /api/merchants`. */
export interface Merchant extends MerchantRef {
  owner_name: string;
  address: string | null;
  maps_url: string | null;
  shop_photo_url: string | null;
  is_premium: boolean;
  phone: string | null;
  email: string | null;
}

/** An entry in a menu's `items[]`. */
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

/** A row of `GET /api/menu-items` — the same item with its merchant attached. */
export interface MenuItemWithMerchant extends MenuItem {
  merchant: MerchantRef;
}

/** `GET /api/merchants/{merchantId}/menu`. */
export interface MerchantMenu {
  id: number;
  title: string | null;
  description: string | null;
  is_published: boolean;
  merchant: MerchantRef;
  items: MenuItem[];
}
