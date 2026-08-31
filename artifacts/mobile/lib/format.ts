/**
 * The API sends money as a string with a separate currency ("175.00" + "EGP").
 * Parsing it into a Number loses precision on large values and invites float
 * artefacts, so group the digits textually and never convert.
 *
 * Intl/toLocaleString is deliberately avoided — Hermes ships without full ICU unless
 * explicitly built with it, so locale grouping is not reliable on Android.
 */
export function formatPrice(price: string, currency = 'EGP'): string {
  const [whole, fraction] = String(price ?? '').split('.');
  const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction && fraction !== '00'
    ? `${grouped}.${fraction} ${currency}`
    : `${grouped} ${currency}`;
}

/** "30" -> "30 min", null -> null. */
export function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes == null) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

/** "car_wash" -> "Car wash". */
export function humanizeActivity(activity: string): string {
  const spaced = activity.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
