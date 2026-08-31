import { TextStyle, ViewStyle } from 'react-native';
import type { Locale } from '@/i18n';

/**
 * App layout direction, driven by the **locale** rather than `I18nManager`.
 *
 * `I18nManager.forceRTL()` only takes effect on the next app start and does not persist
 * at all in Expo Go, so relying on it left the Arabic UI laid out left-to-right —
 * titles, labels and inputs all starting from the wrong edge.
 *
 * Yoga's `direction` style mirrors an entire subtree immediately and works everywhere,
 * so the root view sets it from the resolved locale. `flexDirection: 'row'`, `start`,
 * `end`, and the logical margin/padding properties all follow it.
 *
 * The flag is set once during startup, before the first render — see `app/_layout.tsx`.
 */
let IS_RTL = false;

export function setAppDirection(locale: Locale) {
  IS_RTL = locale === 'ar';
}

export function isRTL() {
  return IS_RTL;
}

/** Put this on the root view; everything below it mirrors. */
export function rootDirection(): Pick<ViewStyle, 'direction'> {
  return { direction: IS_RTL ? 'rtl' : 'ltr' };
}

/**
 * Text aligned to the reading edge / the opposite edge.
 *
 * `textAlign` has no logical `start`/`end` value in React Native, and neither obvious
 * answer works on its own:
 *
 * - `'auto'` resolves against the **view's** layout direction on Android (correct) but
 *   against the **text's own** direction on iOS (`NSTextAlignmentNatural`). That is why
 *   an Arabic screen on iOS pushed every Latin string — a name, an email, `01013161388`
 *   — back to the left while the Arabic label beside it sat right.
 * - `'right'` in an Arabic screen rendered against the **left** edge, on both platforms.
 *
 * The reason is `doLeftAndRightSwapInRTL` (on by default): the platform mirrors an
 * explicit `left`/`right` against the **resolved layout direction of the view**, exactly
 * as it does for `marginLeft` and friends. Measured on the emulator with
 * `I18nManager.isRTL === false` and only the root view's Yoga `direction` set to `rtl`,
 * so it is the view's direction that drives it, not the native flag.
 *
 * So inside a mirrored subtree `'left'` *is* the start edge — no flag to read, and it
 * stays correct whether the mirroring came from Yoga or from `I18nManager`.
 */
export function alignStart(): Pick<TextStyle, 'textAlign'> {
  return { textAlign: 'left' };
}

/** Opposite edge — for a value shown at the end of a row. */
export function alignEnd(): Pick<TextStyle, 'textAlign'> {
  return { textAlign: 'right' };
}

/**
 * Where a `TextInput`'s text and caret sit.
 *
 * Separate from `alignStart()` because `TextInput` behaves differently from `Text`: the
 * `doLeftAndRightSwapInRTL` mirroring that makes `'left'` mean "start" for a `Text` does
 * **not** apply to an input, so an input given `'left'` in Arabic puts its caret on the
 * literal left while its Arabic placeholder sits right. Name the physical edge instead.
 * This is also what `components/FormField.tsx` needs inside its non-mirrored row.
 */
export function alignInput(): Pick<TextStyle, 'textAlign'> {
  return { textAlign: IS_RTL ? 'right' : 'left' };
}

/**
 * Pins a Latin/numeric run left-to-right inside Arabic copy.
 *
 * `+201019967781` is made entirely of bidi-weak and bidi-neutral characters, so in an
 * Arabic paragraph the leading `+` is reordered to the far end and it renders as
 * `201019967781+`. The style prop that would fix this — `writingDirection` — is **iOS
 * only**, so this wraps the value in Unicode isolate controls instead, which both
 * platforms' text engines honour: U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL
 * ISOLATE.
 *
 * Only for runs that are genuinely Latin/numeric. An Egyptian plate like `ا ج ب 234`
 * contains strong RTL letters and must keep its natural order — do not isolate it.
 */
export function ltrIsolate(value: string): string;
export function ltrIsolate(value: string | null | undefined): string | null;
export function ltrIsolate(value: string | null | undefined): string | null {
  if (!value) return value ?? null;
  return IS_RTL ? `\u2066${value}\u2069` : value;
}
