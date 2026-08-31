# Known issues — code vs. contract drift

Found while building these docs by diffing `artifacts/mobile/services/` against the
verified API examples. **Nothing here has been fixed** — this is a to-do list, not a
changelog.

## 1. The scan result screen renders blank — confirmed bug

`services/scan.ts` types the scan response as flat:

```ts
export interface ScannedCar {
  id: number;
  plate_number: string;
  make?: string; model?: string; color?: string;
}
```

The verified `GET /api/scan/{qrCode}` 200 response is **nested**:

```json
{
  "headline": "Does this car need its owner?",
  "car": { "make": "Kia", "model": "Sportage", "color": "Black",
           "plate_number": "ABC 1234", "photo_url": null },
  "actions": [ { "type": "double_parked", "label": "It's double-parked / blocking" } ]
}
```

So in `app/(main)/scanner.tsx:54-64`, `car.id` is `undefined` → the route receives the
string `"undefined"`, and `plate` / `make` / `model` / `color` all fall back to `''`.
The stranger-facing screen shows nothing about the car.

This is **not a one-line fix**. There is no `id` in the payload at all, so
`app/scan/[id].tsx` is mis-keyed — it should key on `qrCode`. Two related losses:

- `headline` is discarded; the screen hardcodes its own copy.
- `actions[]` is discarded; `app/scan/[id].tsx:20-24` hardcodes an `ALERTS` array
  instead of rendering what the server returned. The three types happen to match today,
  so a server-side change would silently do nothing.

## 2. `Car` is missing `qr_url`

`POST /api/cars` returns both `qr_code` and `qr_url` (a ready-made SVG, e.g.
`…/storage/qr/QAR-PCYJRHWRN0.svg`). The `Car` interface in `services/cars.ts` declares
only `qr_code`.

This matters because `(main)/qr-display.tsx` renders the QR client-side with
`react-native-qrcode-svg`, and its **Download** and **Share** buttons are
`Alert.alert('… coming in the next update')` stubs — while the server has already
produced a shareable file the app is ignoring.

## 3. Dead `data`-unwrapping in `listCars`

`services/cars.ts` accepts `Car[] | { data: Car[] }`. The API sets
`JsonResource::withoutWrapping()` globally, so responses are **never** wrapped. The
`{ data }` branch is unreachable. `CarsListResponse` is exported and never referenced.

## 4. Two Postman error examples are from a local dev box, not production

`Cars → Show car (403)` and `QR scan → Scan QR code (404)` are 17 KB and 16.5 KB
Laravel `APP_DEBUG=true` dumps, with file paths like `/Users/sherif/sites/Qar/vendor/…`.
They were captured against a developer's machine, not `qar-4uh5.onrender.com`.

**Do not implement against those shapes.** Production returns the compact envelopes
documented in [api/README.md](api/README.md). The doc generator strips the
`trace`/`file`/`line`/`exception` keys and marks the body `_Stack trace omitted._`.

## 5. Unreachable and dead code

| Item | State |
| --- | --- |
| `app/(auth)/phone.tsx`, `app/(auth)/otp.tsx` | Complete OTP flow — challenge, 4-digit entry, 30s resend timer, register-vs-login. **Nothing navigates to them**; `welcome.tsx` comments "OTP is intentionally hidden for now". |
| `deleteCar` / `CarsContext.removeCar` | Both exist and are wired to each other. No screen calls `removeCar` — there is no delete-car UI. |
| `getCar(id)`, `getToken()` | Exported, zero call sites. (`getMe()` is now used by the profile screen.) |
| `app/(main)/search-car.tsx` | The Search button has **no `onPress` handler at all**. Not "coming soon" — structurally inert. No backend endpoint exists for plate search either. |
| `app/(main)/service.tsx` | All 6 services are static copy; every row is a handler-less `Pressable`. No endpoints exist for any of them. |
| `app/(tabs)/` | Legacy stubs, both just `<Redirect href="/(main)/home" />`. |
| `app/auth/callback` | **Missing.** `welcome.tsx` builds a Google redirect URI pointing at it. |

## 6. No 401 handling

The token lasts 30 days and there is no refresh endpoint, no interceptor, and no expiry
check. When it expires the user sees a generic error on whatever screen they touched,
and stays "logged in" from the app's point of view. `getMe()` already exists and is
never called — it is the natural session-validity probe.

## 7. Stale duplicate of the API spec in the repo

`attached_assets/Pasted--info-name-Qar-API-*.txt` is an older export with **32
endpoints in 9 groups** — missing the entire **Google** and **Merchant menu** groups.
Anything grepping `attached_assets/` will conclude those endpoints don't exist.

Canonical copy: `.claude/reference/Qar.postman_collection.json` (41 endpoints,
11 groups). Consider deleting the stale one — git history keeps it.

## 8. RTL: the two traps that cost the most time

Both were found by measuring on the emulator, not by reading docs, and both are
counter-intuitive enough to be worth writing down.

**`textAlign: 'right'` renders on the LEFT inside a mirrored subtree.**
`doLeftAndRightSwapInRTL` is on by default and mirrors an explicit `left`/`right` against
the view's **resolved layout direction** — the same treatment `marginLeft` gets. Measured
with `I18nManager.isRTL === false` and only the root view's Yoga `direction` set to `rtl`,
so it follows the *view*, not the native flag. Inside a mirrored subtree `'left'` is
therefore the start edge. `lib/direction.ts` `alignStart()` / `alignEnd()` encode this.

`textAlign: 'auto'` is *not* a safe substitute: Android resolves it against the view's
direction (correct), but iOS resolves it against the **text's own** direction
(`NSTextAlignmentNatural`), so Latin strings in an Arabic screen — a name, an email,
`01013161388`, a car's make/model — snap back to the left while the Arabic label beside
them sits right. That is an iOS-only bug that never reproduces on the emulator.

**`writingDirection` is iOS-only.** `+201019967781` is entirely bidi-weak/neutral, so in
an Arabic paragraph the leading `+` moves to the far end and it renders `201019967781+`.
`writingDirection: 'ltr'` fixes it on iOS and does nothing on Android. Use
`ltrIsolate()` (`lib/direction.ts`), which wraps the value in U+2066 … U+2069 and works
on both. Only for genuinely Latin/numeric runs — an Egyptian plate like `ا ج ب 234` has
strong RTL letters and must keep its natural order.

## 9. Changing language restarts the app, and the white screen is Expo Go's

The white screen mid-switch is **Expo Go's own project loader** ("Loading from
127.0.0.1:8082…", app icon on white). No JS of ours runs while it is up, so no overlay can
cover it. In a dev client or release build `restartApp()` takes `reloadAppAsync()` and the
app comes back on its own dark splash instead.

**Why the restart is needed.** Every style says `fontFamily: FONT.bold` (= `'AppBold'`).
`expo-font`'s public `loadAsync` refuses to re-point a loaded name (`Font.js` →
`loadFontInNamespaceAsync` returns early on `isLoaded`).

**That guard *is* skippable — and it still does not help.** `lib/fonts.ts` reaches the
native `ExpoFontLoader.loadAsync` directly and both platforms honour the overwrite
(Android's `ReactFontManager.setTypeface` replaces the entry; iOS unregisters first, with
the comment *"or someone wants to override a font"*, and its `.notRegistered → true`
branch makes swapping to a different file work). Verified on iOS by binding the opposite
family last: English rendered in IBM Plex Sans instead of Inter.

**It was reverted anyway.** React Native caches text measurements keyed on the attributed
string, and `fontFamily` stays `'AppBold'` through the swap. Any string that is
byte-identical in both languages therefore reuses a width measured with the *other* family
and renders **clipped**: the `Qar` wordmark came out `Qa`, the signed-in name `QarTester`
came out `QarTeste`. Translated copy was unaffected — which is exactly what made the
approach look like it worked. Backend data (plate numbers, merchant names, plan names,
prices) is identical across locales too, so it would have been corrupted app-wide.

A fresh JS context has no such cache. `lib/fonts.ts` is kept as the **boot-time** binder;
its re-point ability is deliberately unused.

**The only way to remove the restart** is to stop needing two families — i.e. render both
languages in IBM Plex Sans Arabic, whose Latin is IBM Plex Sans. That is a product
decision about English typography, not a technical one.

**Two traps found along the way, both still live:**

1. **React Compiler caches anything with no reactive input.** The root view's direction
   came from a bare `rootDirection()` inside a memoised style array and never invalidated.
   It now derives from the `locale` prop. Anything rendered above a locale-keyed remount
   must take direction from a prop, not from `lib/direction`.
2. `I18nManager.forceRTL` **does not survive an Expo Go cold start** — measured:
   `nativeIsRTL` came back `false` on a fresh launch after a switch that set it. That is
   why layout direction is driven by the root view's Yoga `direction`.

## 10. Form rows are a deliberate LTR island

`components/FormField.tsx` sets `direction: 'ltr'` on its input row, so the leading icon,
the `+20` dialling code and the eye toggle keep their physical positions in both
languages. Only the typed text follows the reading edge. This is a product decision (the
user asked for it explicitly), and it has a useful side effect: inside a subtree that
never mirrors, `textAlign: 'right'` unambiguously means right, so none of the
`doLeftAndRightSwapInRTL` reasoning in §8 applies there.

**`TextInput` does not behave like `Text`.** The swap that makes `'left'` mean "start" for
a `Text` does not apply to an input: an input given `'left'` in Arabic put its caret on
the literal left while its Arabic placeholder sat right. So inputs use `alignInput()`
(names the physical edge) and everything else uses `alignStart()` (relies on the swap).
Mixing them up is silent — it only shows as a caret on the wrong side.

`alignInput()` is applied in `FormField`, `add-car.tsx` (3 inputs) and `search-car.tsx`.
`otp.tsx`'s digit boxes are centred and exempt.

## 11. `AppShellSkeleton` — where it is still used

`components/AppShellSkeleton.tsx` is text-free (it must render before the locale and font
aliases are bound) and comes in two shapes: `app` for a signed-in user and `auth` for a
signed-out one, because the gate is crossed on the way to two different screens.

Since the switch stopped restarting the app it is barely seen during a language change —
only the brief font-alias rebind. It still earns its place at `app/index.tsx`, which shows
it while the session hydrates from AsyncStorage on a genuine cold start; that used to be a
bare spinner on an empty background.
