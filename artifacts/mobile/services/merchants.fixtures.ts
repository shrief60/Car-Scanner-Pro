/**
 * TEMPORARY local data for the merchant browsing flow.
 *
 * The API cannot serve this feature yet — `GET /api/merchants` is a 404 on the live
 * server and no merchant profiles are seeded, so even the real
 * `GET /api/merchants/{id}/menu` returns 404 for every id. See
 * `.claude/docs/api/merchant-menu.md` for the endpoints this stands in for.
 *
 * **Delete this file when `USE_FIXTURES` in `services/merchants.ts` flips to false.**
 * Nothing outside that module may import it.
 *
 * The data deliberately reproduces the hazards of the real payload so the UI is built
 * against them rather than discovering them in production:
 *   - item ids COLLIDE across merchants (each menu numbers from 1) — forces the
 *     composite keyExtractor in the cross-merchant feed to be correct
 *   - one null image_url and one URL that really 404s — exercises the placeholder path
 *   - one `is_available: false` item, one very long name, one null description
 *   - prices with a .50 fraction and a four-digit value — exercises formatPrice
 *   - `fuel_station` has zero merchants — exercises the empty state
 */
import type {
  ActivityType,
  Merchant,
  MenuItem,
  MerchantMenu,
  MerchantRef,
} from '@/types/merchants';

/** Flip by hand to exercise the error + Retry path. */
const FORCE_ERROR = false;

/** Without latency you build skeletons you never actually see. */
const LATENCY_MS = 450;

export function delay(ms = LATENCY_MS) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function guard() {
  if (FORCE_ERROR) {
    const err = new Error('Could not reach the services directory') as Error & { status?: number };
    err.status = 500;
    throw err;
  }
}

/**
 * Themed placeholder images in the app palette, so the fixture screens look designed
 * rather than like random stock photos. (picsum.photos was tried first and was
 * returning 522s — don't reintroduce a flaky host here.)
 */
const img = (label: string) =>
  `https://placehold.co/400x400/16433B/e5f0ed/png?text=${encodeURIComponent(label)}`;
/** A real Qar storage path that genuinely 404s — the broken-image case. */
const BROKEN_IMAGE = 'https://qar-4uh5.onrender.com/storage/menu-items/does-not-exist.jpg';

interface Shop {
  merchant: Merchant;
  title: string;
  description: string | null;
  items: MenuItem[];
}

function item(
  id: number,
  name: string,
  price: string,
  category: string,
  extra: Partial<MenuItem> = {},
): MenuItem {
  return {
    id,
    name,
    description: `${name} — carried out by certified technicians using original parts.`,
    price,
    currency: 'EGP',
    image_url: img(name),
    category,
    duration_minutes: 30,
    is_available: true,
    sort_order: id,
    ...extra,
  };
}

const SHOPS: Shop[] = [
  {
    merchant: {
      id: 101,
      shop_name: 'Cairo Auto Care',
      activity_type: 'maintenance',
      logo_url: img('Cairo Auto Care'),
      address: '14 El Nasr St, Nasr City, Cairo',
      items_count: 8,
    },
    title: 'Cairo Auto Care — Services',
    description: 'Full mechanical and electrical servicing.',
    items: [
      item(1, 'Full engine oil change', '850.00', 'Engine', { duration_minutes: 45 }),
      item(2, 'Brake pad replacement', '1250.00', 'Brakes', { duration_minutes: 90 }),
      item(3, 'Air conditioning regas', '349.50', 'Comfort'),
      item(4, 'Computer diagnostics scan', '200.00', 'Diagnostics', {
        description: null,
      }),
      item(5, 'Comprehensive 40-point pre-summer inspection and cooling system flush', '1750.00', 'Inspection', {
        duration_minutes: 120,
      }),
      item(6, 'Battery replacement', '2400.00', 'Electrical'),
      item(7, 'Wheel alignment', '450.00', 'Tyres', { is_available: false }),
      // No image at all — the placeholder path.
      item(8, 'Radiator flush', '600.00', 'Engine', { image_url: null }),
    ],
  },
  {
    merchant: {
      id: 102,
      shop_name: 'Nasr City Motor Works',
      activity_type: 'maintenance',
      logo_url: img('Motor Works'),
      address: '8 Abbas El Akkad, Nasr City, Cairo',
      items_count: 6,
    },
    title: 'Motor Works — Menu',
    description: 'Engine specialists since 1998.',
    items: [
      item(1, 'Timing belt replacement', '3200.00', 'Engine', { duration_minutes: 180 }),
      item(2, 'Clutch overhaul', '4500.00', 'Transmission', { duration_minutes: 240 }),
      item(3, 'Suspension check', '300.00', 'Suspension'),
      item(4, 'Spark plug set', '750.00', 'Engine', { image_url: BROKEN_IMAGE }),
      item(5, 'Gearbox oil change', '980.50', 'Transmission'),
      item(6, 'Exhaust repair', '1100.00', 'Exhaust'),
    ],
  },
  {
    merchant: {
      id: 103,
      shop_name: 'El Sherouk Advanced Automotive Service Centre',
      activity_type: 'maintenance',
      logo_url: null,
      address: 'Ring Rd, El Shorouk City',
      items_count: 5,
    },
    title: 'El Sherouk — Workshop',
    description: null,
    items: [
      item(1, 'Engine tune-up', '1400.00', 'Engine'),
      item(2, 'Headlight restoration', '400.00', 'Body'),
      item(3, 'Cooling system flush', '700.00', 'Engine'),
      item(4, 'Steering rack repair', '2600.00', 'Steering'),
      item(5, 'Fuel injector cleaning', '900.00', 'Engine'),
    ],
  },
  {
    merchant: {
      id: 201,
      shop_name: 'Qar Accessories Hub',
      activity_type: 'accessories',
      logo_url: img('Accessories Hub'),
      address: '22 El Merghany, Heliopolis, Cairo',
      items_count: 5,
    },
    title: 'Accessories Hub',
    description: 'Interior and exterior upgrades.',
    items: [
      item(1, 'Ceramic coating', '5500.00', 'Exterior', { duration_minutes: 300 }),
      item(2, 'Dash camera install', '1800.00', 'Electronics'),
      item(3, 'Leather seat covers', '3200.00', 'Interior'),
      item(4, 'Window tinting', '2100.00', 'Exterior'),
      item(5, 'Ambient lighting kit', '950.00', 'Interior'),
    ],
  },
  {
    merchant: {
      id: 202,
      shop_name: 'Maadi Style Auto',
      activity_type: 'accessories',
      logo_url: img('Maadi Style'),
      address: 'Road 9, Maadi, Cairo',
      items_count: 4,
    },
    title: 'Maadi Style — Catalogue',
    description: 'Styling and detailing.',
    items: [
      item(1, 'Alloy wheel refurbishment', '2800.00', 'Wheels'),
      item(2, 'Roof rack fitting', '1600.00', 'Exterior'),
      item(3, 'Premium floor mats', '650.00', 'Interior'),
      item(4, 'Phone mount + charger', '320.50', 'Electronics'),
    ],
  },
  {
    merchant: {
      id: 301,
      shop_name: 'Spark Wash Maadi',
      activity_type: 'car_wash',
      logo_url: img('Spark Wash'),
      address: 'Road 216, Degla, Maadi',
      items_count: 3,
    },
    title: 'Spark Wash — Services',
    description: 'Interior and exterior car care.',
    items: [
      item(1, 'Full exterior wash', '175.00', 'Wash'),
      item(2, 'Interior deep clean', '400.00', 'Wash'),
      item(3, 'Engine bay cleaning', '250.00', 'Wash'),
    ],
  },
];

function refOf(m: Merchant): MerchantRef {
  return { id: m.id, shop_name: m.shop_name, activity_type: m.activity_type };
}

export async function listMerchants(activityType?: ActivityType): Promise<Merchant[]> {
  await delay();
  guard();
  return SHOPS.filter(s => !activityType || s.merchant.activity_type === activityType).map(
    s => s.merchant,
  );
}

export async function getMerchantMenu(merchantId: number): Promise<MerchantMenu> {
  await delay();
  guard();
  const shop = SHOPS.find(s => s.merchant.id === merchantId);
  if (!shop) {
    const err = new Error('This shop is no longer available.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return {
    id: shop.merchant.id,
    title: shop.title,
    description: shop.description,
    is_published: true,
    merchant: refOf(shop.merchant),
    items: shop.items,
  };
}

/** Flattened cross-merchant feed — each row carries its own merchant. */
export async function listMenuItems(activityType?: ActivityType) {
  await delay();
  guard();
  return SHOPS.filter(s => !activityType || s.merchant.activity_type === activityType).flatMap(
    s => s.items.map(i => ({ ...i, merchant: refOf(s.merchant) })),
  );
}
