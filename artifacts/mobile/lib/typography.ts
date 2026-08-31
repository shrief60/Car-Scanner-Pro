import { TextStyle } from 'react-native';
import { isRTL } from '@/lib/direction';

/**
 * Font aliases.
 *
 * Styles never name a concrete family. `app/_layout.tsx` binds these four aliases to
 * either Inter or IBM Plex Sans Arabic at load time, chosen from the **resolved
 * locale** — so a static `StyleSheet.create` can hold `fontFamily: FONT.bold` and still
 * be correct in every case.
 *
 * Why not switch on `I18nManager.isRTL`: that answers "is the view mirrored", not
 * "what language is this". An Android device set to Arabic with the app set to English
 * reports `isRTL === true`, which would render English in an Arabic face; and in Expo
 * Go `forceRTL` never persists, so `isRTL` is permanently false and Arabic would render
 * in Inter forever. The alias is driven by the locale itself and avoids both.
 */
export const FONT = {
  regular: 'AppRegular',
  medium: 'AppMedium',
  semibold: 'AppSemiBold',
  bold: 'AppBold',
} as const;


/**
 * `letterSpacing` pulls apart Arabic letters that must join cursively. Safe on Latin
 * content (plates, OTP digits, the Qar wordmark); never apply it to anything that can
 * hold Arabic — user initials, names, translated copy.
 */
export function latinLetterSpacing(value: number): Pick<TextStyle, 'letterSpacing'> {
  return { letterSpacing: isRTL() ? 0 : value };
}
