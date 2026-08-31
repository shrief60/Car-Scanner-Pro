import { TextStyle } from 'react-native';
import { isRTL } from '@/lib/direction';

/**
 * RTL helpers.
 *
 * Direction comes from `lib/direction` (the resolved locale), never `I18nManager` —
 * `I18nManager.isRTL` is permanently false in Expo Go, so anything keyed to it silently
 * stops mirroring during development.
 *
 * Everything here is a **function**: `lib/direction` is populated during startup, after
 * these modules have already been evaluated, so a module-scope constant would capture
 * LTR forever. The same rule that applies to `t()` applies here.
 *
 * Box layout itself needs no help — the root view carries Yoga's `direction`, so `row`,
 * `start`/`end` and the logical margin/padding properties mirror on their own.
 */

/** Icon glyphs do not mirror — swap the name instead of transforming the view. */
const MIRRORED: Record<string, string> = {
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back-outline': 'arrow-forward-outline',
  'arrow-forward-outline': 'arrow-back-outline',
  'chevron-forward': 'chevron-back',
  'chevron-back': 'chevron-forward',
  'chevron-forward-outline': 'chevron-back-outline',
  'chevron-back-outline': 'chevron-forward-outline',
};

/**
 * `mirrorIcon('chevron-forward')` → `'chevron-back'` under RTL.
 * A name swap rather than `scaleX: -1`: it needs no transform on a Pressable child and
 * the mirrored glyph is the one the icon set actually drew.
 */
export function mirrorIcon<T extends string>(name: T): T {
  // Generic so the literal type survives — @expo/vector-icons types `name` as a union
  // of glyph names, and a widened `string` would not satisfy it.
  return isRTL() ? ((MIRRORED[name] ?? name) as T) : name;
}

/** For glyphs with no mirrored twin in the set (e.g. `log-out-outline`). */
export function flipIfRTL(): TextStyle {
  return isRTL() ? { transform: [{ scaleX: -1 }] } : {};
}

