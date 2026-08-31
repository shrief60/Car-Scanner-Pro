# Qar

Expo mobile app giving every car a QR sticker, so a stranger can alert the owner
without seeing any personal data.

> **`CLAUDE.md` at the repo root is the canonical guide**, with detail in `.claude/docs/`.
> This file is kept for Replit's convention and only summarises.

## Run & Operate

- `cd artifacts/mobile && pnpm exec expo start --port 8082 --localhost` — run the app
  locally, then press `i` / `a`. (The `dev` script in `artifacts/mobile/package.json`
  is Replit-specific — it needs `$REPLIT_EXPO_DEV_DOMAIN`, `$REPLIT_DEV_DOMAIN`,
  `$REPL_ID` and `$PORT`.)
- `pnpm --filter @workspace/mobile run typecheck` — typecheck the app
- `pnpm run typecheck` — typecheck the whole workspace
- `pnpm exec expo install --fix` (from `artifacts/mobile`) — realign package versions
  with the Expo SDK

**No local backend and no database.** The app talks to a remote Laravel + Sanctum API
at `https://qar-4uh5.onrender.com`. `DATABASE_URL` is not required.

Env: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`,
`EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` — set here under `[userenv.shared]` in `.replit`;
Google sign-in fails without them.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- App: Expo SDK 54, React Native 0.81.5, expo-router 6, React 19
- New Architecture + React Compiler enabled, `typedRoutes` on
- State: React context (`AuthContext`, `CarsContext`); token in AsyncStorage
- Backend: **remote** Laravel + Sanctum (not in this repo)

## Where things live

- `artifacts/mobile/` — the app. Routes in `app/`, HTTP in `services/`, state in `context/`.
- `.claude/docs/api/` — the 41-endpoint API reference, generated from
  `.claude/reference/Qar.postman_collection.json` by `.claude/tools/gen-api-docs.py`.
- `attached_assets/` — the founder's original spec material.
- `artifacts/api-server`, `artifacts/mockup-sandbox`, `lib/*` — **unused scaffolding**
  from the workspace template. The app imports none of it.

## Gotchas

- `pnpm exec` fails at the workspace root (`ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`) — run
  it inside `artifacts/mobile` or use `--filter`.
- Port 8081 is used by another local project; use 8082.
- `pnpm-workspace.yaml` → `allowBuilds.esbuild` must stay a boolean. The template
  shipped the string `set this to true or false`, which made every `pnpm add` exit 1.
- See `.claude/docs/known-issues.md` before editing `artifacts/mobile/services/` —
  several types do not match the real API responses.

## Pointers

- `CLAUDE.md` — start here
- `.claude/docs/product.md` — what the product actually is
