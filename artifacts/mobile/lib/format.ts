import { t, type TranslationKey } from '@/i18n';

/**
 * The API sends money as a string with a separate currency ("175.00" + "EGP").
 * Parsing it into a Number loses precision on large values and invites float
 * artefacts, so group the digits textually and never convert.
 *
 * Intl/toLocaleString is deliberately avoided — Hermes ships without full ICU unless
 * explicitly built with it, so locale grouping is not reliable on Android.
 */
export function formatPrice(price: string, currency?: string): string {
  const unit = currency ?? t('format.currency');
  const [whole, fraction] = String(price ?? '').split('.');
  const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction && fraction !== '00'
    ? `${grouped}.${fraction} ${unit}`
    : `${grouped} ${unit}`;
}

/** "30" -> "30 min" / "٣٠ دقيقة". Units come from the catalogue. */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes == null) return null;
  const min = t('format.minutes');
  const hr = t('format.hours');
  if (minutes < 60) return `${minutes} ${min}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ${hr} ${rest} ${min}` : `${hours} ${hr}`;
}

/**
 * "car_wash" -> "Car wash" / "غسيل سيارات".
 *
 * Was string surgery on the API slug, which produced English that could not be
 * translated. Now a keyed lookup; an unknown slug falls back to `activity.other`.
 */
export function humanizeActivity(activity: string): string {
  const known = ['car_wash', 'maintenance', 'fuel_station', 'accessories', 'other'];
  return t(`activity.${known.includes(activity) ? activity : 'other'}` as TranslationKey);
}

/**
 * "2026-07-04T…" -> "July 2026" / "يوليو 2026".
 *
 * Not `toLocaleDateString`: Hermes ships without full ICU, so it returns English month
 * names whatever the locale is — which is exactly what the profile screen was showing
 * on an Arabic UI. The month comes from the catalogue instead.
 */
export function formatMonthYear(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const month = t(`months.${d.getMonth() + 1}` as TranslationKey);
  return `${month} ${d.getFullYear()}`;
}
