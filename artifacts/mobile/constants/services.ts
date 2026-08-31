import type { ActivityType } from '@/types/merchants';

export const SERVICE_INFO: Record<string, { label: string; icon: string; color: string; description: string; items: string[] }> = {
  maintenance: { label: 'Maintenance', icon: 'construct-outline', color: '#4ade80', description: 'Keep your car safe, reliable, and ready for the road.', items: ['Book a service', 'Find nearby workshops', 'Service history'] },
  accessories: { label: 'Accessories', icon: 'color-palette-outline', color: '#60a5fa', description: 'Discover accessories that make every drive better.', items: ['Browse accessories', 'Interior upgrades', 'Exterior upgrades'] },
  marketplace: { label: 'Buy & Sell', icon: 'swap-horizontal-outline', color: '#fbbf24', description: 'Buy your next car or list your current one.', items: ['Browse cars for sale', 'Sell your car', 'Saved listings'] },
  notifications: { label: 'Notifications', icon: 'notifications-outline', color: '#c084fc', description: 'Stay updated about your cars and alerts.', items: ['Car alerts', 'Qar updates', 'Account activity'] },
  reminders: { label: 'Reminders', icon: 'calendar-outline', color: '#fb923c', description: 'Keep track of maintenance, renewals, and important dates.', items: ['Add a reminder', 'Upcoming reminders', 'Reminder history'] },
  sos: { label: 'SOS', icon: 'alert-circle-outline', color: '#f87171', description: 'Get help quickly when you need it.', items: ['Emergency contacts', 'Roadside assistance', 'Share my location'] },
};

/**
 * Which home tiles are backed by real merchants.
 *
 * Only two of the six map to a merchant `activity_type` — `marketplace`, `reminders`,
 * `sos` and `notifications` are not merchant categories at all, so they keep the
 * static placeholder. `car_wash` and `fuel_station` are valid activity types with no
 * home tile yet; adding one is a single entry here plus a tile in home.tsx.
 */
export const SERVICE_ACTIVITY: Record<string, ActivityType | null> = {
  maintenance: 'maintenance',
  accessories: 'accessories',
  marketplace: null,
  reminders: null,
  sos: null,
  notifications: null,
};
