import { Asset } from 'expo-asset';
import { requireNativeModule } from 'expo';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import type { Locale } from '@/i18n';

/**
 * Binds the four font aliases to a concrete family, and **re-binds them without an app
 * restart** when the language changes.
 *
 * Every style in the app says `fontFamily: FONT.bold` (= `'AppBold'`), so switching the
 * typeface is a matter of pointing that one name at a different file. `expo-font`'s
 * public `loadAsync` refuses to do that — `Font.js` → `loadFontInNamespaceAsync` returns
 * early when `isLoaded(name)` — which is why this used to need a full reload, and why the
 * reload was the only thing putting Expo Go's white loading screen on screen.
 *
 * The guard is purely a JS-side optimisation. Both native implementations are built to
 * overwrite:
 *
 * - **Android** (`FontLoaderModule.kt`): `ReactFontManager.setTypeface(name, NORMAL, tf)`
 *   replaces whatever that name pointed at.
 * - **iOS** (`FontLoaderModule.swift`): unregisters an already-registered alias first,
 *   with the comment *"or someone wants to override a font"*.
 *
 * So this calls the native module directly, skipping the JS cache check. It mirrors
 * `expo-font`'s own `loadSingleFontAsync` (resolve asset → download → `loadAsync`).
 *
 * The native module is reached through the public `requireNativeModule` rather than
 * `expo-font`'s private `build/ExpoFontLoader` path. `loadAsync(name, localUri)` is the
 * same function `expo-font` itself calls, and its signature is explicitly frozen — both
 * native files carry a "do NOT change the function signature as it'll break consumers"
 * note, because RN vector icons calls it too.
 *
 * If any of this fails, `setLocale` falls back to restarting the app: the old behaviour,
 * not a broken one.
 */

type FontLoaderModule = { loadAsync(fontFamilyName: string, localUri: string): Promise<void> };

/** Resolved lazily — a throw here is caught by the caller and degrades to a restart. */
let loader: FontLoaderModule | undefined;
function fontLoader(): FontLoaderModule {
  return (loader ??= requireNativeModule<FontLoaderModule>('ExpoFontLoader'));
}
const FAMILIES: Record<Locale, Record<string, number>> = {
  en: {
    AppRegular: Inter_400Regular,
    AppMedium: Inter_500Medium,
    AppSemiBold: Inter_600SemiBold,
    AppBold: Inter_700Bold,
  },
  ar: {
    AppRegular: IBMPlexSansArabic_400Regular,
    AppMedium: IBMPlexSansArabic_500Medium,
    AppSemiBold: IBMPlexSansArabic_600SemiBold,
    AppBold: IBMPlexSansArabic_700Bold,
  },
};

/** Which family the aliases currently point at, so a no-op switch stays a no-op. */
let boundLocale: Locale | null = null;

export function boundFontLocale() {
  return boundLocale;
}

export async function bindFontAliases(locale: Locale): Promise<void> {
  if (boundLocale === locale) return;

  const map = FAMILIES[locale];
  await Promise.all(
    Object.entries(map).map(async ([alias, mod]) => {
      const asset = Asset.fromModule(mod);
      await asset.downloadAsync();
      if (!asset.localUri) {
        throw new Error(`Font asset for "${alias}" has no localUri`);
      }
      await fontLoader().loadAsync(alias, asset.localUri);
    }),
  );

  boundLocale = locale;
}
