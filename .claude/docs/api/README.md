# Qar API — conventions and coverage

The backend is a **Laravel + Sanctum** service. It is *not* in this repo — it is
deployed and owned elsewhere. Everything below was derived from the Postman export
(`.claude/reference/Qar.postman_collection.json`) and the contract note at
`attached_assets/Pasted-contract-Every-body-below-is-copied-from-a-real-respons_*.txt`.

```
Base URL   https://qar-4uh5.onrender.com
Client     artifacts/mobile/services/api.ts   (hand-rolled fetch wrapper)
```

> `artifacts/api-server/` and `lib/api-client-react/` are **empty scaffolding** and are
> not used by the app. Do not add endpoints there expecting the app to pick them up.

## Endpoint reference

| File | Covers |
| --- | --- |
| [auth.md](auth.md) | OTP, password, Google, account & session (20 endpoints) |
| [cars.md](cars.md) | Car CRUD and QR generation (4) |
| [scan.md](scan.md) | Public QR scan and alerts (2) |
| [print-requests.md](print-requests.md) | Physical QR sticker orders (3) |
| [subscriptions.md](subscriptions.md) | Packages and subscriptions (5) |
| [merchant-menu.md](merchant-menu.md) | Merchant shop menu (6) |
| [payments.md](payments.md) | Paymob webhook (1) — server-to-server, not a client concern |

Those files are generated. To refresh them after the backend changes, replace
`.claude/reference/Qar.postman_collection.json` and run:

```bash
python3 .claude/tools/gen-api-docs.py
```

Only the region between `<!-- BEGIN GENERATED -->` and `<!-- END GENERATED -->` is
rewritten, so prose you add around it survives.

**If the backend added or removed endpoints, the script will refuse to run** — that is
deliberate, not a breakage. It prints what it found; bump `EXPECT_ENDPOINTS` /
`EXPECT_RESPONSES` in the script to match, and add any new Postman folder to its
`GROUP_FILE` map. It also refuses if the collection contains a live bearer token.

## Authentication

Bearer token on every authenticated call:

```
Authorization: Bearer <token>
X-Device-Name: Pixel 8 / Qar 1.4.0     # optional, names the token in the session list
```

- **Token lifetime is 30 days** (`TOKEN_LIFETIME_MINUTES=43200`). There is no refresh
  endpoint — an expired token means re-authenticating.
- A token carries exactly one ability: **`act-as:client` XOR `act-as:merchant`**, never
  both. `POST /api/auth/switch-mode` **revokes the current token** and returns a new
  one; anything holding the old token must be updated.
- The contract recommends storing the token in the keychain. The app currently keeps it
  in **AsyncStorage** under `@qar_session_v2` — see [../architecture.md](../architecture.md).

### The three flags on an auth response

Every auth response carries `is_new_user`, `needs_phone`, `needs_profile`. They drive
navigation:

| Flag | Meaning | What the app must do |
| --- | --- | --- |
| `is_new_user` | account was just created | onboarding instead of straight to home |
| `needs_phone` | no phone on file (Google never supplies one) | `POST /auth/otp/challenge` → `POST /auth/link/otp`. **Required before QR and print flows.** |
| `needs_profile` | no profile row for the active mode | profile completion screen |

Call `POST /api/auth/google/login` only. `/google/register` is the same call returning
`201`; the server decides whether the identity is new and reports it via `is_new_user`.

### Password registration requirements

`POST /api/auth/password/register` rejects submissions that look fine client-side
unless all of these hold:

| Field | Rule |
| --- | --- |
| `phone` | **Required**, E.164 (`+201013161388`). Not optional — omitting it returns *"The phone field is required."* |
| `password` | **Minimum 8 characters.** Keep any client-side rule in step with this. |
| `email` | Must be a valid address and not already taken |

`phone` is also unique — a second account on the same number returns
*"The phone has already been taken."*

## Response conventions

- Responses are **never wrapped in `data`** — `JsonResource::withoutWrapping()` is set
  globally. (`services/cars.ts` defensively unwraps `{ data: [...] }` anyway; that
  branch is dead.)
- Collections come back as bare JSON arrays.
- Money is a **string** (`"99.00"`), with a separate `currency` (`"EGP"`).
- Timestamps are ISO-8601 UTC (`2026-08-29T15:20:23.000000Z`).
- **`POST /api/menu/items/{menuItemId}` is a `PUT` in disguise.** It sends Laravel's
  `_method` form field because multipart uploads can't be sent as a real PUT. Send it
  as a `POST` with `_method` in the body — an actual `PUT` returns 405.

### Error envelopes

`422` — validation. The standard Laravel shape, and the most common failure:

```json
{
  "message": "The id token field is required.",
  "errors": { "id_token": ["The id token field is required."] }
}
```

`409` — Google email already registered. **Branch on `error`, not on the message:**

```json
{
  "error": "requires_link",
  "provider": "google",
  "email": "taken@example.com",
  "message": "This email is already registered. Log in with your existing method, then link Google."
}
```

`403` — business-rule refusal, carrying a machine-readable `code`:

```json
{ "message": "An active subscription is required to request a printed QR code.",
  "code": "subscription_required" }
```

`401` — `{ "message": "Unauthenticated." }`. **The app has no 401 interceptor**; an
expired token currently surfaces as a generic error on whatever screen triggered it.

`429` — rate limited. `throttle:auth-login` allows **10/min per phone+IP** on the auth
routes and returns a `Retry-After` header.

`services/api.ts` maps all of these onto a thrown `Error` with `.status`, `.code`
(from the response's `error` field) and `.details`.

## Access levels

| Level | Endpoints |
| --- | --- |
| **Public** (no token) | all OTP/password/Google auth routes, `GET /api/scan/{qrCode}`, `POST /api/scan/{qrCode}/alerts`, `GET /api/packages`, `GET /api/merchants/{merchantId}/menu` |
| **Any authenticated** | `GET /api/auth/me`, `GET /api/user`, logout, logout-all, link/unlink, switch-mode |
| **`act-as:client`** | cars, print requests, subscriptions |
| **`act-as:merchant`** | `GET/PUT /api/menu`, `/api/menu/items*` |
| **Server-to-server** | `POST /api/payments/paymob/webhook` |

## Coverage — what the app actually calls

Audited against `artifacts/mobile/services/`. Keep this current when you wire something up.

**Live** — reachable by a user today:

| Endpoint | Client function | Screen |
| --- | --- | --- |
| `POST /api/auth/password/register` | `passwordRegister` | `(auth)/register.tsx` |
| `POST /api/auth/password/login` | `passwordLogin` | `(auth)/login.tsx` |
| `POST /api/auth/google/login` | `googleLogin` | `(auth)/welcome.tsx` |
| `POST /api/auth/logout` | `logoutApi` | `(main)/profile.tsx` |
| `GET /api/auth/me` | `getMe` | `(main)/profile.tsx` |
| `GET /api/cars` | `listCars` | `(main)/profile.tsx` |
| `POST /api/cars` | `createCar` | `(main)/add-car.tsx` |
| `GET /api/scan/{qrCode}` | `scanQrCode` | `(main)/scanner.tsx` |
| `POST /api/scan/{qrCode}/alerts` | `sendAlert` | `scan/[id].tsx` |

**Built but unreachable** — code exists, no user can get to it:

| Endpoint | Client function | Why it's unreachable |
| --- | --- | --- |
| `POST /api/auth/otp/challenge` | `sendOtpChallenge` | `(auth)/phone.tsx` and `otp.tsx` are complete, but nothing navigates to them — `welcome.tsx` says "OTP is intentionally hidden for now" |
| `POST /api/auth/otp/register` | `otpRegister` | same |
| `POST /api/auth/otp/login` | `otpLogin` | same |
| `GET /api/cars/{carId}` | `getCar` | implemented, zero call sites |
| `DELETE /api/cars/{carId}` | `deleteCar` / `removeCar` | service and context method exist, no delete UI |

**Not implemented** — no client code at all:

`POST /api/auth/password/forgot` · `POST /api/auth/password/reset` ·
`POST /api/auth/google/register` · `POST /api/auth/link/google` ·
`DELETE /api/auth/link/google` · `POST /api/auth/link/password` ·
`POST /api/auth/link/otp` · `POST /api/auth/switch-mode` ·
`POST /api/auth/logout-all` · `GET /api/user` ·
all of **print requests** (3) · all of **packages & subscriptions** (5) ·
all of **merchant menu** (6) · the **Paymob webhook** (server-side by design).

The largest gap is the monetization chain — see [../product.md](../product.md).
