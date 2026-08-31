# Architecture

## What is real, and what is scaffolding

This repo was generated from a Replit pnpm-workspace template. **Most of the workspace
is unused template code.** Only `artifacts/mobile` matters.

```
artifacts/mobile/        ← THE APP. Expo SDK 54, expo-router. All real work happens here.
artifacts/api-server/    ✗ empty Express scaffold — src/app.ts declares no routes
artifacts/mockup-sandbox/✗ template leftover
lib/api-spec/            ✗ openapi.yaml declares only /healthz
lib/api-client-react/    ✗ generated client exporting only useHealthCheck
lib/api-zod/, lib/db/    ✗ template leftovers
attached_assets/         source material the founder supplied (see below)
.claude/                 these docs
```

**The backend is not in this repo.** It is a remote Laravel + Sanctum service at
`https://qar-4uh5.onrender.com`, reached through a hand-rolled fetch wrapper in
`artifacts/mobile/services/api.ts`. Adding a route to `artifacts/api-server` or
`lib/api-spec/openapi.yaml` does nothing — the app never imports either.

> `artifacts/mobile/package.json` declares `"@workspace/api-client-react": "workspace:*"`
> and `tsconfig.json` has a project reference to it, which makes the scaffolding look
> load-bearing. It has **zero imports** in any source file.

## The app

Stack: **Expo SDK 54** · React Native 0.81.5 · expo-router 6 · React 19 ·
TypeScript 5.9 · New Architecture enabled · React Compiler enabled · `typedRoutes` on.

```
artifacts/mobile/
  app/                  expo-router file-based routes
    _layout.tsx         provider stack, font loading, splash gate
    index.tsx           redirects on auth state
    (auth)/             welcome, login, register, phone, otp
    (main)/             home, add-car, qr-display, scanner, search-car, service
    scan/[id].tsx       the stranger-facing alert screen
    (tabs)/             legacy stubs, both just <Redirect> to /(main)/home
  services/             api.ts, auth.ts, cars.ts, scan.ts
  context/              AuthContext.tsx, CarsContext.tsx
  constants/colors.ts   the single palette
  hooks/useColors.ts
```

Provider order in `app/_layout.tsx`:
`SafeAreaProvider → ErrorBoundary → QueryClientProvider → AuthProvider → CarsProvider
→ GestureHandlerRootView → KeyboardProvider → Stack`.

### Routes

| Route | Screen | Talks to |
| --- | --- | --- |
| `/` | redirect on `isAuthenticated` | — |
| `/(auth)/welcome` | landing, Google sign-in | `googleLogin` |
| `/(auth)/login` | email + password | `passwordLogin` |
| `/(auth)/register` | sign-up with strength meter | `passwordRegister` |
| `/(auth)/phone`, `/(auth)/otp` | full OTP flow — **unreachable** | `sendOtpChallenge`, `otpRegister`, `otpLogin` |
| `/(main)/home` | car list (max 3) + 6 static service tiles | `listCars`, `logoutApi` |
| `/(main)/add-car` | plate/make/model/colour + photo | `createCar` |
| `/(main)/qr-display` | renders the QR; download/share are stubs | — (params only) |
| `/(main)/scanner` | camera barcode scan | `scanQrCode` |
| `/(main)/search-car` | **inert** — the button has no `onPress` | — |
| `/(main)/service` | static copy for 6 services, no handlers | — |
| `/scan/[id]` | stranger picks an alert | `sendAlert` |

### Auth and token handling

`AuthContext` owns the session. The token lives in **two** places:

- module scope in `services/api.ts` (`let _token`), set via `setToken()`
- **AsyncStorage** under `@qar_session_v2`, as a JSON blob that includes the raw bearer
  token

`setToken` has exactly three call sites: `loadSession()` on mount, `persistSession()`
after any successful auth, and `logout()`.

Things to know before touching auth:

- **AsyncStorage, not SecureStore/keychain.** The API contract recommends the keychain.
  This is a deliberate-looking shortcut, not an oversight to fix casually — changing it
  means a migration for existing installs.
- **No 401 interceptor, no refresh, no expiry handling** — despite a 30-day token
  lifetime. An expired token surfaces as a generic error on whatever screen triggered it.
- `logout()` swallows every server error in a `try/catch` and clears local state anyway.
- Tokens are single-ability (`act-as:client` XOR `act-as:merchant`) and
  `POST /api/auth/switch-mode` **revokes the current one**. Nothing in the app calls it.

`CarsContext` is in-memory only — no persistence, and no react-query despite
`QueryClientProvider` being mounted. `fetchCars` handles its own errors; `addCar` and
`removeCar` let them propagate to the caller.

### Theme

`constants/colors.ts` defines one palette and assigns it to **both** `light` and `dark`:

```ts
const colors = { light: brandDark, dark: brandDark, radius: 14 };
```

So `useColors()` is effectively a constant — and **only `app/+not-found.tsx` calls it**.
Every other screen hardcodes hex literals. `#4a8a82` is used pervasively as a muted
colour and **is not in the palette at all**. There are no typography or spacing tokens;
font families are inline strings (`'Inter_600SemiBold'`) and every size is per-screen.

If you touch styling, prefer extending the palette over adding more literals — but be
aware you are working against the grain of the existing code.

## Source material in `attached_assets/`

The founder's originals. Two are stale or hard to find, so **prefer `.claude/`**:

| File | Status |
| --- | --- |
| `Pasted--info-name-Qar-API-*.txt` | ⚠️ **STALE** — 32 endpoints in 9 groups. Missing the entire Google and Merchant-menu groups. Use `.claude/reference/Qar.postman_collection.json` (41 endpoints) instead. |
| `Pasted-contract-*.txt` | The Google-auth contract note. Its content is folded into [api/README.md](api/README.md). Truncated mid-sentence in the original. |
| `Qar-htwsl-fa-thwana_*_compressed.pdf` | Compressed copy of the Canva spec deck. Summarised in [product.md](product.md). |
| `generated_images/qar-icon.png` | The app icon. |

## Conventions worth matching

- Path aliases: `@/` maps to the `artifacts/mobile` root.
- Services return typed promises and throw on non-2xx; screens catch and set local
  error state.
- `api.postForm` deliberately omits `Content-Type` so `fetch` sets the multipart
  boundary — do not "fix" that.
- Screens use the web-inset pattern `insets.top + (Platform.OS === 'web' ? 67 : 0)`.
