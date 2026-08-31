# Qar

Expo mobile app. Every car gets a QR sticker; a stranger scans it and alerts the owner
without ever seeing a phone number. Around that sits a merchant network, subscriptions
and printed QR stickers.

## Where the code is

**`artifacts/mobile`** — the app. Expo SDK 54, expo-router, React Native 0.81.5.
That is the only directory that matters.

**These are unused template scaffolding. Do not add features to them:**

```
artifacts/api-server    artifacts/mockup-sandbox   lib/api-client-react
lib/api-spec            lib/api-zod                lib/db
```

`lib/api-spec/openapi.yaml` declares only `/healthz` — it is **not** the API contract
and editing it changes nothing. The real backend is a remote **Laravel + Sanctum**
service at `https://qar-4uh5.onrender.com`; its contract is in `.claude/docs/api/`.
There is no local backend to run.

## Run it

```bash
cd artifacts/mobile
pnpm exec expo start --port 8082 --localhost   # then press i (iOS) or a (Android)
```

Not `pnpm dev` — that script only works on Replit. Not from the repo root — `pnpm exec`
goes recursive there and fails with `Command "expo" not found`; use
`pnpm --filter @workspace/mobile exec …` instead. Port 8081 belongs to another project.
Details and simulator setup: `.claude/docs/running-locally.md`.

Auth forms use **react-hook-form + yup** — schemas in `lib/schemas.ts`, shared input in
`components/FormField.tsx`, 422→field routing in `lib/serverErrors.ts`. **Reactotron**
is wired for API/log inspection (`reactotron.config.ts`); it needs the desktop app plus
`adb reverse tcp:9090 tcp:9090` on Android.

## Gotchas

- **Google sign-in silently fails locally.** The `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` vars
  live in `.replit` under `[userenv.shared]` and are empty on a dev machine.
- **The auth token is in AsyncStorage** (`@qar_session_v2`), not SecureStore, and there
  is **no 401 interceptor, no refresh, no expiry handling** — tokens last 30 days.
- **`useColors()` is effectively a constant** — `constants/colors.ts` assigns the same
  palette to `light` and `dark`, and only `app/+not-found.tsx` calls it. Every other
  screen hardcodes hex literals. Take values from `.claude/docs/design-system.md`.
- **Dark theme only.** `app.json` sets `userInterfaceStyle: "dark"`; there is no light mode.
- **The whole OTP UI is built but unreachable** — nothing navigates to
  `app/(auth)/phone.tsx`; `welcome.tsx` hides it deliberately.
- **`GET /api/scan/{qrCode}` returns a nested shape** that `services/scan.ts` types
  incorrectly, so the scan result screen renders blank. See `.claude/docs/known-issues.md`.
- **`attached_assets/Pasted--info-name-Qar-API-*.txt` is a stale 32-endpoint export.**
  The current one is 43 endpoints in `.claude/reference/`.
- Responses are **never** wrapped in `data`; money is a string (`"99.00"`) with a
  separate `currency`.

## Docs

| | |
| --- | --- |
| `.claude/docs/api/README.md` | API conventions, auth model, error envelopes, and which endpoints the app actually calls. Indexes the 43-endpoint reference. |
| `.claude/docs/design-system.md` | **Read before building any new screen.** Colours, type scale, spacing, component recipes, and a new-screen checklist. |
| `.claude/docs/architecture.md` | Repo map, routes, state/auth handling, theme. |
| `.claude/docs/product.md` | What Qar is: privacy model, tiers, merchant side, and where the spec diverges from what was built. |
| `.claude/docs/known-issues.md` | Confirmed code-vs-contract drift. Read before touching `services/`. |
| `.claude/docs/running-locally.md` | Full run and simulator setup. |

The files under `.claude/docs/api/` are generated. After the backend changes, replace
`.claude/reference/Qar.postman_collection.json` and run:

```bash
python3 .claude/tools/gen-api-docs.py
```

It rewrites only the region between the `BEGIN/END GENERATED` markers, so prose around
it survives. It deliberately **refuses to run** if the endpoint count changed (bump
`EXPECT_ENDPOINTS` / `EXPECT_RESPONSES`, and map any new Postman folder in `GROUP_FILE`)
or if a live bearer token is present in the collection.
