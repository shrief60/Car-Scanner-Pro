import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { CarsProvider } from '@/context/CarsContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { resolveInitialLocale, setActiveLocale, type Locale } from '@/i18n';
import { isRTL, setAppDirection } from '@/lib/direction';
import { bindFontAliases } from '@/lib/fonts';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Dev-only inspector for API calls, logs and AsyncStorage. `main` is expo-router/entry,
// so this root layout is the earliest module we control. Stripped from release builds.
if (__DEV__) {
  require('@/reactotron.config');
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      // There is no window to focus in RN, and the default refetch is wasted work.
      refetchOnWindowFocus: false,
      // The default is 3 retries with backoff — on a 404 (currently the reality for
      // every merchant endpoint) that is ~7s of spinner before the error shows.
      // services/api.ts puts the HTTP status on the thrown Error, so only retry 5xx.
      retry: (failureCount, error) =>
        failureCount < 1 && ((error as { status?: number }).status ?? 500) >= 500,
    },
  },
});

/**
 * Android's `slide_from_right` is a literal `fromXDelta="100%"` translate animation and
 * is NOT mirrored by layout direction, so an RTL build would push screens in from the
 * wrong side. iOS mirrors its native push on its own, so `default` is correct there.
 */
function stackAnimation() {
  // Android's slide_from_right is a literal fromXDelta="100%" translate and is NOT
  // mirrored by layout direction, so pick the side explicitly. iOS mirrors its own
  // native push, so 'default' is right there.
  if (Platform.OS !== 'android') return 'default' as const;
  return isRTL() ? ('slide_from_left' as const) : ('slide_from_right' as const);
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: stackAnimation(),
        // Without this the root stack falls back to React Navigation's white card
        // background, which the slide transition exposes behind the screens.
        contentStyle: { backgroundColor: '#082926' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
      <Stack.Screen name="scan/[id]" />
      <Stack.Screen name="legal/[doc]" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

/**
 * The app under a resolved locale.
 *
 * A language change re-points the four font aliases at the other family in place (see
 * `lib/fonts.ts`) and remounts the navigator, so every `Text` is rebuilt and picks up the
 * new typeface — no app restart, which is what used to expose Expo Go's white loading
 * screen. Re-rendering here is also what updates the root view's direction.
 */
function LocalisedApp({
  locale,
  onLocaleChange,
}: {
  locale: Locale;
  onLocaleChange: (next: Locale) => void;
}) {
  return (
    <SafeAreaProvider>
      {/* Yoga mirrors this entire subtree — no I18nManager, so it works in Expo Go.
          The direction is derived from the `locale` prop rather than read from
          `lib/direction`: React Compiler memoises this style array, and a bare
          `rootDirection()` call has no reactive input for it to invalidate on, so the
          layout kept the direction it was first rendered with while the copy and fonts
          switched underneath it. */}
      <View style={[{ flex: 1, backgroundColor: '#082926' }, { direction: locale === 'ar' ? ('rtl' as const) : ('ltr' as const) }]}>
        <ErrorBoundary>
        <LocaleProvider locale={locale} onLocaleChange={onLocaleChange}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <CarsProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    {/* Keyed by locale so a language change remounts every screen — and
                        therefore every Text — against the re-pointed font aliases. Kept
                        below the providers on purpose: auth and query caches survive, so
                        the switch does not re-hydrate the session. expo-router restores
                        the current URL across the remount, so the user stays on the
                        screen they were on rather than being sent back to Home. */}
                    <RootLayoutNav key={locale} />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </CarsProvider>
            </AuthProvider>
          </QueryClientProvider>
        </LocaleProvider>
        </ErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    (async () => {
      const resolved = await resolveInitialLocale();
      // All three imperatively, *before* the state update, so the very first render is
      // already translated, mirrored and in the right typeface — an effect would cost a
      // frame of English in the wrong direction.
      setActiveLocale(resolved);
      setAppDirection(resolved);
      try {
        await bindFontAliases(resolved);
      } catch (e) {
        console.warn('[fonts] could not bind aliases; falling back to system faces', e);
      }
      setLocale(resolved);
      SplashScreen.hideAsync();
    })();
  }, []);

  // Splash stays up (preventAutoHideAsync above) until locale, direction and typeface are
  // all settled, so there is no first layout pass to correct.
  if (locale === null) return null;

  return <LocalisedApp locale={locale} onLocaleChange={setLocale} />;
}
