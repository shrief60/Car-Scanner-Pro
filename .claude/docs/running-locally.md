# Running the app locally

Verified on macOS (Intel), 2026-08-30 — iOS 26.4 simulator and an Android 17 emulator
both running the app off one Metro instance.

## The command

```bash
cd ~/Documents/Projects/Tasks/Car-Scanner-Pro/artifacts/mobile
pnpm exec expo start --port 8082 --localhost
```

Then press **`i`** for iOS, **`a`** for Android.

From any directory, the equivalent is:

```bash
pnpm --filter @workspace/mobile exec expo start --port 8082 --localhost
```

Every part of that command is load-bearing:

| Flag | Why |
| --- | --- |
| **not `pnpm dev`** | The package's `dev` script is Replit-only. It interpolates `$REPLIT_EXPO_DEV_DOMAIN`, `$REPLIT_DEV_DOMAIN`, `$REPL_ID` and `$PORT`, which are all empty here — you get `EXPO_PACKAGER_PROXY_URL=https://` and a bare `--port`. |
| **run from `artifacts/mobile`** | At the workspace root `pnpm exec` goes recursive and fails with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL: Command "expo" not found`. Use `--filter` instead if you want to stay at the root. |
| **`--port 8082`** | Port 8081 is occupied by the `olfah-app` project. Don't kill it. |
| **`--localhost`** | Makes Expo serve `exp://127.0.0.1` and set up `adb reverse tcp:8082 tcp:8082` itself. Without it Expo hands Android the host LAN IP, which works at first but breaks after an emulator restart ("Something went wrong" in Expo Go). |

Expo Go is sufficient — no native dev build is needed.
`react-native-keyboard-controller`, imported in `app/_layout.tsx`, **is** bundled in
Expo Go SDK 54. That matters, because the only JDKs on this machine are Corretto 18 and
JetBrains 25 — neither is the JDK 17 an `expo run:android` gradle build expects.

## First-time setup

```bash
pnpm install          # from the repo root
```

If you need a simulator running first:

```bash
# Android
"$ANDROID_HOME/emulator/emulator" -avd Pixel_10 &
adb wait-for-device shell 'while [ -z "$(getprop sys.boot_completed)" ]; do sleep 2; done'

# iOS
xcrun simctl list devices booted
```

Launch the emulator **detached** (`setsid nohup … & disown`) or it dies with the shell
that started it.

## Google sign-in does not work locally

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `_IOS_` and `_ANDROID_` live in `.replit` under
`[userenv.shared]`, which only Replit reads. Locally they default to `''`, so the
"Continue with Google" button on the welcome screen fails silently.

To test it, copy the three values from `.replit` into `artifacts/mobile/.env`
(gitignored):

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
```

Note there is also **no `app/auth/callback` route**, though `welcome.tsx` builds a
redirect URI pointing at `auth/callback`.

## Reactotron — inspecting API calls and logs

Config lives in `artifacts/mobile/reactotron.config.ts` and is imported from
`app/_layout.tsx` behind `if (__DEV__)`, so it never reaches a release build. It is pure
JS with no native module, which is why it works inside Expo Go.

One-time install of the desktop app:

```bash
brew install --cask reactotron
```

Then, with the app running:

```bash
adb reverse tcp:9090 tcp:9090     # Android emulator only; iOS reaches localhost directly
```

Open Reactotron **before** reloading the app — it connects on startup and retries
quietly, so nothing is broken if the desktop app isn't up, you just see nothing.

What you get:

- **Every API call**, automatically. The networking plugin patches XHR and React Native
  implements `fetch` over XHR, so calls made through `services/api.ts` appear with no
  code changes. Metro's own traffic is filtered out via `ignoreUrls`.
- **AsyncStorage** — inspect the `@qar_session_v2` blob directly.
- **`console.tron.log(...)`** from anywhere (typed in `types/reactotron.d.ts`).
  Plain `console.log` still goes to the Metro terminal.

## Backend

There is nothing to run. The app talks to `https://qar-4uh5.onrender.com`. No local
database, no `DATABASE_URL`. (It's a free Render instance, so the first request after
an idle period can take ~30s to wake.)

## Known environment gotchas

- **`pnpm install` used to exit 1** because `pnpm-workspace.yaml` shipped the literal
  placeholder `esbuild: set this to true or false` under `allowBuilds`. Fixed to
  `esbuild: true` on 2026-08-30. If you see `ERR_PNPM_IGNORED_BUILDS` breaking
  `pnpm add` or `pnpm exec`, that key is the cause.
- `pnpm-workspace.yaml` still overrides the macOS esbuild binaries away
  (`"esbuild>@esbuild/darwin-arm64": "-"`, commented *"replit uses linux-x64 only"*).
  esbuild's postinstall works around it by fetching from npm. Harmless for the mobile
  app; expect friction if `api-server` is ever built locally.
- Expo will warn about package versions drifting from the SDK 54 expectations. Fix with
  `pnpm exec expo install --fix` from `artifacts/mobile`.
