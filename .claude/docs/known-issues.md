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
