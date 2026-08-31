import React, { createContext, useCallback, useContext, useState } from 'react';
import { DevSettings, I18nManager, Platform } from 'react-native';
import { reloadAppAsync } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { isRTL as isRTLDirection, setAppDirection } from '@/lib/direction';
import { bindFontAliases } from '@/lib/fonts';
import {
  getActiveLocale,
  isArabic,
  persistLocale,
  setActiveLocale,
  t,
  type Locale,
  type TranslationKey,
} from '@/i18n';

interface LocaleContextValue {
  locale: Locale;
  isRTL: boolean;
  /** Persists, re-points the font aliases, flips direction, and remounts the app. */
  setLocale: (next: Locale) => Promise<void>;
  switching: boolean;
  t: (key: TranslationKey, options?: Record<string, unknown>) => string;
}

/**
 * Fallback only — the switch no longer restarts the app.
 *
 * `lib/fonts.ts` re-points the aliases at runtime and `app/_layout.tsx` remounts the
 * tree, so a language change is now instant. This is kept for the case where that fails
 * (a future `expo-font` that stops honouring an alias overwrite): a restart still gets
 * the user a correct app, at the cost of Expo Go's white loading screen.
 *
 * `reloadAppAsync()` was observed to be a no-op under Expo Go, so Expo Go gets
 * `DevSettings.reload()`; everywhere else takes `reloadAppAsync()`, which comes up on
 * the app's own dark splash.
 */
async function restartApp() {
  if (IS_EXPO_GO) {
    try {
      DevSettings.reload('locale changed');
      return;
    } catch {
      // fall through
    }
  }
  try {
    await reloadAppAsync();
  } catch (e) {
    console.warn('[locale] restart failed; a manual restart will finish the switch', e);
  }
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function LocaleProvider({
  locale,
  onLocaleChange,
  children,
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
  children: React.ReactNode;
}) {
  const [switching, setSwitching] = useState(false);

  /**
   * Switches language in place: no restart, so no loading screen of any kind.
   *
   * Order matters. i18n, direction and the font aliases are all updated *before* the
   * state change that remounts the tree, so the very first frame of the new language is
   * already correct — there is no window where new copy renders in the old direction.
   */
  async function setLocale(next: Locale) {
    if (next === locale || switching) return;
    setSwitching(true);

    try {
      setActiveLocale(next);
      setAppDirection(next);
      // The one genuinely async step (~a bundled asset decode). The skeleton covers it.
      await bindFontAliases(next);
      await persistLocale(next);

      // Not needed for our own layout — direction comes from `lib/direction` — but it
      // makes the *native* views (a TextInput's default alignment, Android's own
      // widgets) mirror correctly from the next cold start onwards. No reload here.
      const shouldBeRTL = isArabic(next);
      if (Platform.OS !== 'web' && shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      // Remounts `LocalisedApp` under a new key, so every Text is rebuilt against the
      // re-pointed aliases.
      onLocaleChange(next);
    } catch (e) {
      // Re-pointing the aliases is the only step that can realistically fail. Fall back
      // to the old behaviour rather than leaving the user in a half-switched app.
      console.warn('[locale] in-place switch failed; restarting instead', e);
      await persistLocale(next);
      await restartApp();
    } finally {
      setSwitching(false);
    }
  }

  /**
   * `t` is re-created whenever the locale changes.
   *
   * The bound `i18n.t` is a stable reference, and React Compiler (enabled in app.json)
   * memoizes any subtree whose only dependency is a stable function — so with a fixed
   * identity, changing `i18n.locale` re-translates nothing until a full reload. Keying
   * the identity to `locale` invalidates those memoized subtrees, which is what makes
   * the switch work in place even when the reload does not fire.
   */
  const translate = useCallback(
    (key: TranslationKey, options?: Record<string, unknown>) => t(key, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  return (
    <LocaleContext.Provider
      value={{
        locale,
        isRTL: isRTLDirection(),
        setLocale,
        switching,
        t: translate,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be inside LocaleProvider');
  return ctx;
}

/**
 * `I18nManager` is deliberately NOT reconciled at startup.
 *
 * The obvious "if isRTL !== wantRTL then forceRTL + reload" check is an infinite reload
 * loop in Expo Go, where `forceRTL` never persists so the mismatch is permanent. The
 * native flip happens only inside the explicit `setLocale()` user action — loop-proof
 * by construction.
 *
 * Nothing in the app reads `I18nManager.isRTL`; layout direction comes from
 * `lib/direction`, which is set from the resolved locale before the first render. The
 * `forceRTL` call is kept only so that in a release build the *native* views
 * (TextInput's default alignment, Android's own widgets) mirror on the next launch.
 */
export { getActiveLocale };
