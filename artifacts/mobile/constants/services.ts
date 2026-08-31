import type { ActivityType } from '@/types/merchants';

/**
 * The six home Services tiles.
 *
 * These hold **translation keys, not text**. This module evaluates before the locale is
 * resolved, so calling `t()` here would bake in whichever language happened to load
 * first — invisible in dev, because Fast Refresh re-evaluates modules after the locale
 * is set, and only reproducible on a cold start. Screens resolve the keys at render.
 *
 * `home.tsx` renders the same set from `SERVICE_IDS`, so the two can no longer drift.
 */
export const SERVICE_IDS = [
  'maintenance',
  'accessories',
  'marketplace',
  'reminders',
  'sos',
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number] | 'notifications';

export interface ServiceMeta {
  icon: string;
  color: string;
  /** Keys into the `services` namespace — see i18n/en.ts. */
  labelKey: string;
  subtitleKey: string;
  descriptionKey: string;
  /** Three placeholder rows on the static service screen. */
  itemKeys: string[];
}

export const SERVICE_INFO: Record<string, ServiceMeta> = {
  maintenance: {
    icon: 'construct-outline',
    color: '#4ade80',
    labelKey: 'services.maintenanceLabel',
    subtitleKey: 'services.maintenanceSubtitle',
    descriptionKey: 'services.maintenanceDescription',
    itemKeys: [],
  },
  accessories: {
    icon: 'color-palette-outline',
    color: '#60a5fa',
    labelKey: 'services.accessoriesLabel',
    subtitleKey: 'services.accessoriesSubtitle',
    descriptionKey: 'services.accessoriesDescription',
    itemKeys: [],
  },
  marketplace: {
    icon: 'swap-horizontal-outline',
    color: '#fbbf24',
    labelKey: 'services.marketplaceLabel',
    subtitleKey: 'services.marketplaceSubtitle',
    descriptionKey: 'services.marketplaceDescription',
    itemKeys: [],
  },
  notifications: {
    icon: 'notifications-outline',
    color: '#c084fc',
    labelKey: 'services.notificationsLabel',
    subtitleKey: 'services.notificationsSubtitle',
    descriptionKey: 'services.notificationsDescription',
    itemKeys: [],
  },
  reminders: {
    icon: 'calendar-outline',
    color: '#fb923c',
    labelKey: 'services.remindersLabel',
    subtitleKey: 'services.remindersSubtitle',
    descriptionKey: 'services.remindersDescription',
    itemKeys: [],
  },
  sos: {
    icon: 'alert-circle-outline',
    color: '#f87171',
    labelKey: 'services.sosLabel',
    subtitleKey: 'services.sosSubtitle',
    descriptionKey: 'services.sosDescription',
    itemKeys: [],
  },
};

/**
 * Which home tiles are backed by real merchants.
 *
 * Only two map to a merchant `activity_type`; `marketplace`, `reminders`, `sos` and
 * `notifications` are not merchant categories, so they keep the static placeholder.
 */
export const SERVICE_ACTIVITY: Record<string, ActivityType | null> = {
  maintenance: 'maintenance',
  accessories: 'accessories',
  marketplace: null,
  reminders: null,
  sos: null,
  notifications: null,
};

/** Complete translated sentence per category — never a noun spliced into a frame. */
export const EMPTY_MENU_KEY: Record<string, string> = {
  maintenance: 'serviceBrowser.noServicesMaintenance',
  accessories: 'serviceBrowser.noServicesAccessories',
};
