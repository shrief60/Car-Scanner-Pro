import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { en, type Translations } from './en';
import { ar } from './ar';

export type Locale = 'en' | 'ar';

export const LOCALES: Locale[] = ['en', 'ar'];
const STORAGE_KEY = '@qar_locale_v1';

const i18n = new I18n({ en, ar });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
// A user should never see `[missing "ar.x" translation]`. In dev make it loud so it is
// caught; in production fall through to the English string.
i18n.missingBehavior = __DEV__ ? 'message' : 'guess';

/**
 * i18n-js v4's `t` is a class method that uses `this` — destructuring it
 * (`const { t } = i18n`) silently breaks. Bind it once.
 */
export const t = i18n.t.bind(i18n);

/** Dot-path keys derived from the English catalogue, so a typo fails `tsc`. */
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];
export type TranslationKey = Paths<Translations>;

export function setActiveLocale(locale: Locale) {
  i18n.locale = locale;
}

export function getActiveLocale(): Locale {
  return (i18n.locale as Locale) ?? 'en';
}

export function isArabic(locale: Locale = getActiveLocale()) {
  return locale === 'ar';
}

/** Persisted choice → device language → English. */
export async function resolveInitialLocale(): Promise<Locale> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    // A storage read failure should never block startup — fall through to the device.
  }
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
}

export async function persistLocale(locale: Locale) {
  await AsyncStorage.setItem(STORAGE_KEY, locale);
}

export default i18n;
