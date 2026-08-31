# Qar — what the product is

> **Qar = a digital identity for every car in Egypt — safe contact + smart payment +
> a services network, in one app.**
> Tagline: **"هتوصل في ثواني"** ("you'll get through in seconds").

Every car gets a QR sticker. Anyone can scan it and reach the owner **without ever
seeing a phone number**. Around that sits a merchant network and a payment/points
system.

Sources: the two spec decks the founder supplied (a Gamma business deck and a Canva
screen-by-screen deck). Both are **product** authority. Neither is **technical**
authority — see [Spec vs reality](#spec-vs-reality) at the bottom, which matters a lot.

## The privacy model — the core promise

This is the product's whole reason to exist. Get it wrong and there is no product.

| Always visible to a stranger | Never visible, ever |
| --- | --- |
| First name only (optional) | Phone number |
| Car type / model | Email |
| Car colour | Address |
| Last 4 digits of the plate | Any other personal data |

Stored but hidden: full phone, full email, full car data. At registration the user gives
**explicit consent**: *"I agree that Qar users may contact me via my car's plate number,
while my personal data stays private."*

The public scan endpoint honours this — `GET /api/scan/{qrCode}` returns only
`make`, `model`, `colour`, `plate_number`, `photo_url`, and its Postman description says
outright: *"Owner phone never returned."*

## Three ways to reach a car's owner

All three converge on the same result:

1. **Scan the QR sticker** — the fastest path. Implemented (`(main)/scanner.tsx`).
2. **Type the QAR code** printed on the sticker, e.g. `QAR-CA-00421`. Not implemented.
3. **Type the plate number**, e.g. `دان 124`. Not implemented — this is what the inert
   `(main)/search-car.tsx` screen was meant to be.

> **Plate normalisation is an explicit spec requirement.** `دان124`, `دان 124`,
> `DAN124` and `DAN 124` must all resolve to `DAN-124`. No endpoint for this exists in
> the API yet.

## Alert types

The stranger picks one of three. These are returned by the scan endpoint as a
server-driven `actions[]` array:

| `type` | Meaning |
| --- | --- |
| `double_parked` | blocking / double-parked |
| `lights_on` | headlights left on |
| `danger` | hazard around the car |

The owner receives a push notification. The sender stays anonymous.

## Client tiers

From the business deck. **These do not match the API's packages** — see
[Spec vs reality](#spec-vs-reality).

| | **Free — 0 EGP** | **Silver — 500 EGP / 6 months** | **Gold — 800 EGP / year** |
| --- | --- | --- | --- |
| Register car | ✅ | ✅ | ✅ |
| Alerts | 1 per day | unlimited (voice notifications) | unlimited |
| Merchant search | manual only | automatic nearest merchant (GPS) | + priority in nearby offers |
| Contact owner | notification only | **WebRTC voice call** | + **5-min text chat**, auto-deleted |
| Exclusive merchant offers | ❌ | ✅ | ✅ |
| Plate-number search | ❌ | unlimited | unlimited |
| Extras | — | — | Gold badge, family SOS, monthly expense report, see who searched your car |
| Gift | — | Qar sunshade | sunshade + tissues + air freshener |

Contact escalates by tier: **Free → notification only. Silver → voice call (WebRTC, no
numbers revealed). Gold → temporary text chat that self-deletes.**

## Merchant side

Merchant profile requires: owner name, shop name, full address, shop photo, Google Maps
link, phone, and activity type (car wash / maintenance / fuel / accessories / other).

**Merchant tiers:** Free — 5 services max, basic collection, simple dashboard.
Paid — **500 EGP/month** — unlimited services, detailed stats, featured placement, full
monthly invoice. The "upgrade" prompt appears once they hit 5 services.

**Collection flow:** merchant scans the customer's QR → customer gets a notification
with the amount → customer approves or rejects → on approval the money splits:

| Share | Goes to |
| --- | --- |
| **95%** | the merchant |
| **2%** | customer's Qar credit |
| **1%** | merchant's Qar credit |
| **2%** | Qar (net revenue) |

**Points/cashback:** every **10 EGP spent = 1 point**, added automatically after the
customer approves.

**Qar credit is closed-loop** — spendable on in-app services or subscription renewal,
**never withdrawable as cash**, and it expires after a year if unused.

**Ad packages:** local 500 EGP/mo (2–5 km radius) · category 1000 EGP/mo · general
2000 EGP/mo (all users, Facebook-Ads-style reporting).

**Launch gate for any new area:** at least 10 active merchants, 5 of them running live
offers, covering diverse categories.

## Security rules the founder set for developers

Carried over verbatim in intent from the deck — worth respecting even though the stack
changed:

- Payment provider API keys live **server-side only**, never in the app.
- Credit is only topped up **after the payment webhook**, never optimistically.
- Qar credit never converts to a withdrawable balance.
- Every payment transaction must be **atomic**.
- Keep a full audit log of all operations.
- **Alert records are wiped after 30 days.**
- **Rate-limit plate-number search.**
- **Chat content is not persisted** after the session ends.
- **No collection without the customer's explicit approval.**
- Explicit consent for plate-number lookup is captured at registration.

## Roadmap (founder's plan)

| Phase | Window | Targets |
| --- | --- | --- |
| 0 — MVP | now → month 3 | admin dashboard, client app, merchant app, 7 screens, Paymob, first 50 sunshades, 20 merchants, 50 users |
| 1 — Growth | months 3–6 | Google Play + App Store, 500 subscribers, 50 active merchants |
| 2 — Investor | months 6–12 | 5,000 users, 300 merchants, ~85,000 EGP/month revenue |
| 3 — Expansion | year 2 | used-car marketplace, Verified card, NFC, Saudi Arabia + UAE |

Investor readiness gate: 1,000 active users + 50 active merchants + 20,000 EGP verified
monthly revenue + complete legal docs. Self-assessed at **72/100 — conditional**.

## Spec vs reality

The decks were written before the current implementation. Do not treat them as
technical instructions.

| Deck says | Actually built |
| --- | --- |
| **Flutter** | React Native / **Expo SDK 54** |
| **Firebase** (Auth, Firestore, FCM) | **Laravel + Sanctum** REST API at `qar-4uh5.onrender.com` |
| **Firebase Phone Auth** for OTP | server-issued OTP via `/api/auth/otp/*` |
| Client tiers Free / Silver 500 per 6mo / Gold 800 per yr | API packages are **Monthly 99.00 EGP**, semi-annual, yearly |
| Merchant "collections + points + invoice" system | API exposes a **merchant menu** instead; no collection, points, or wallet endpoints exist |
| WebRTC calls, text chat, SOS, GPS merchant discovery | **nothing** — no endpoints, no client code |
| **Paymob** | ✅ the one thing that carried over (`/api/payments/paymob/webhook`) |

**The biggest gap between spec and app** is the monetization chain. The API already
supports it end to end and the app implements none of it:

```
add car → QR generated → subscribe to a package → order a printed QR sticker
```

`POST /api/print-requests` returns `403 { "code": "subscription_required" }` without an
active subscription, so print requests are gated behind subscriptions by design. See
[api/subscriptions.md](api/subscriptions.md) and [api/print-requests.md](api/print-requests.md).

Also unbuilt from the Canva deck's client MVP: the QR **download** and **share**
actions on `(main)/qr-display.tsx` are still `Alert.alert(...)` placeholders, even
though `POST /api/cars` already returns a ready-made `qr_url` SVG.

## Brand

From the deck, and matching `artifacts/mobile/constants/colors.ts`:

| Token | Hex | Use |
| --- | --- | --- |
| Background / edges | `#082926` | very dark olive green |
| Mid / centre glow | `#16433B` | mid olive green |
| Text | `#FFFFFF` | pure white |

The recurring screen gradient is `['#082926', '#16433B', '#082926']` with
`locations={[0, 0.5, 1]}`.
