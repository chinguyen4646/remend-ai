# Mobile App Development Guide

This React Native client is powered by Expo Router and talks to the Remend API.  
The goal of this guide is to capture everything you need to build locally, run on physical devices, and understand the different Expo workflows.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Start the API](#start-the-api)
5. [Expo Workflows Explained](#expo-workflows-explained)
6. [Run with Expo Go (no custom native modules)](#run-with-expo-go-no-custom-native-modules)
7. [Run a Development Build on Simulator](#run-a-development-build-on-simulator)
8. [Run a Development Build on an iPhone](#run-a-development-build-on-an-iphone)
9. [Networking Checklist](#networking-checklist)
10. [Troubleshooting](#troubleshooting)
11. [Useful Commands](#useful-commands)

---

## Overview

- Framework: Expo + React Native + Expo Router
- State: Zustand stores under `src/stores/`
- API calls: Axios (`src/api/`) hit the backend defined by `EXPO_PUBLIC_API_URL`
- Native modules in use: `@react-native-voice/voice` (requires a custom dev build)

---

## Prerequisites

- **Node.js** ≥ 18 (use nvm if needed)
- **npm** or **yarn** (the repo uses npm)
- **Expo CLI** (bundled via `npx expo …`)
- **Xcode** (macOS, for iOS simulator/device builds)
- **Apple ID** signed in to Xcode for physical-device builds
- Optional: Android Studio (for Android testing)
- **expo-dev-client** dependency (installed automatically where noted)

---

## Environment Configuration

The mobile app reads `EXPO_PUBLIC_API_URL` from `.env` in `mobile-app/`.

```env
# For simulators or the Expo web preview
EXPO_PUBLIC_API_URL=http://localhost:3333

# For real devices (comment localhost and use your Mac's LAN IP)
# EXPO_PUBLIC_API_URL=http://192.168.1.109:3333
```

Tips:

- Simulators share the host network stack, so `localhost` works there. Physical devices need your Mac’s IP.
- Always include the protocol (`http://`). Without it `fetch` builds an invalid URL.
- Replace `192.168.1.109` with whatever `ipconfig getifaddr en0` returns for your machine.
- Restart Metro (`expo start…`) after editing `.env`; environment variables are loaded at boot.

`npx expo start` will echo the `.env` values it loads—double-check the console whenever you change them.

---

## Start the API

The mobile app needs the API running. From the /api root:

```bash
# Start only the API
npm run dev:api

# or start API + mobile concurrently from the root
npm run dev
```

Ensure the Adonis server binds to `0.0.0.0` and not just `localhost`:

```env
# in api/.env
# HOST=127.0.0.1   # simulator-only
HOST=0.0.0.0       # required for phones on the LAN
PORT=3333
```

Test from the phone’s browser: `http://<your-mac-ip>:3333/`. If that works, the app can reach it too.

---

## Expo Workflows Explained

| Workflow                           | When to use it                                                       | Command                       | Notes                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Expo Go**                        | Pure JavaScript, _only_ built-in Expo SDK modules                    | `npx expo start`              | Fast QR reloads. Cannot access custom native modules like voice.                                                  |
| **Development Build (dev client)** | When you add native modules (`@react-native-voice/voice`, BLE, etc.) | `npx expo start --dev-client` | You build your own Expo Go that bundles those modules. Requires one-time Xcode provisioning for physical devices. |
| **Release/EAS build**              | QA/TestFlight/Store builds                                           | `eas build`                   | Uses the same signing assets created for dev clients.                                                             |

In this repo we have a custom native module (`@react-native-voice/voice`), so the **development build** route is required for real device testing.

---

## Run with Expo Go (no custom native modules)

Use this when you only need to exercise screens or features that rely on the built-in Expo APIs.

```bash
cd mobile-app
npm install            # if you have not already
npx expo login         # use the same Expo account as on your phone
npx expo start         # starts Metro for Expo Go
```

On your phone:

1. Install **Expo Go** from the App Store.
2. Sign in to the same Expo account.
3. In the Metro console, press `s` to ensure you’re in Expo Go mode.
4. Scan the QR code with Expo Go or pick your dev server from the “Development Servers” list.

✅ Use this workflow for quick UI iterations. ❌ Do not expect `@react-native-voice/voice` (or any custom native module) to work here.

---

## Run a Development Build on Simulator

Prefer this path if you just need to test your native modules without dealing with iOS signing.

```bash
cd mobile-app
npm install
npx expo install expo-dev-client    # one time
npx expo prebuild                   # generates ios/ and android/ native projects
npx expo run:ios --simulator "iPhone 15"   # install the dev client on a simulator
npx expo start --dev-client         # start Metro for dev builds
```

Then open the simulator (the command launches it automatically) and the dev client will load your bundle. Voice input works because the module is compiled into this build.

---

## Run a Development Build on an iPhone

You need this when you want to test on actual hardware (microphones, push notifications, etc.).

### One-time setup

1. **Install dependencies**

   ```bash
   cd mobile-app
   npm install
   npx expo install expo-dev-client
   npx expo prebuild
   ```

2. **Connect your iPhone** via USB, unlock it, enable **Settings → Privacy & Security → Developer Mode**.

3. **Open the workspace in Xcode**

   ```bash
   open ios/mobileapp.xcworkspace
   ```

4. **Sign in and enable automatic signing**
   - Xcode → Settings → Accounts → add your Apple ID.
   - In the project navigator select the `mobileapp` target → “Signing & Capabilities” → check “Automatically manage signing” and choose your Team.
   - Xcode will create the needed certificate and provisioning profile.

5. **Install the build**
   - Ensure your phone is selected in Xcode’s toolbar.
   - Press the ▶︎ Run button. Xcode installs the dev build onto the device.
   - The first time, approve the “Trust developer” prompt on the device.

### Daily development loop

```bash
cd mobile-app
npx expo start --dev-client            # start Metro
# optionally add --tunnel if discovery fails
# npx expo start --dev-client --tunnel
```

On the phone:

1. Launch the new app icon (your dev client).
2. If it says “No development servers found,” use the in-app dev menu to scan the QR code printed by Metro or start Metro with `--tunnel`.
3. Reload as you normally would (shake to open the dev menu).

You only need the USB cable when installing/updating the dev client. Once it’s on the device, reloads happen over Wi-Fi.

---

## Networking Checklist

- Phone and Mac on the **same Wi‑Fi**. Disable VPNs or firewalls that might block port 8081.
- API host set to `0.0.0.0` so devices can reach it.
- `EXPO_PUBLIC_API_URL` points to the Mac’s IP with protocol: `http://192.168.x.x:3333`.
- If the phone still can’t reach Metro, run `npx expo start --dev-client --tunnel` and scan the QR.
- Test the API via Safari on the phone: `http://192.168.x.x:3333/api/auth/me`. If that works, the app can log in too.

---

## Troubleshooting

| Symptom                                         | Cause                                                          | Fix                                                                           |
| ----------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| “Module X doesn’t exist” in Expo Go             | Custom native modules require a dev build                      | Use `expo start --dev-client` + dev client install                            |
| “No development servers found” on the dev build | Metro not running or device can’t discover it                  | Start Metro with `--dev-client` (add `--tunnel` if necessary) and scan the QR |
| Login succeeds on simulator but not phone       | API still pointed at `localhost` or backend bound to 127.0.0.1 | Update `.env` to use the Mac’s IP and set API `HOST=0.0.0.0`                  |
| `CommandError: No code signing certificates`    | Xcode doesn’t have a provisioning profile for your device      | Sign into Xcode → enable automatic signing → run the project once from Xcode  |
| Voice capture crashes on simulator              | The simulator may not expose a microphone                      | Use a real device for realistic audio testing                                 |
| Metro cache issues                              | Old bundle/assets cached                                       | `npx expo start --dev-client --clear`                                         |
| Expo Go asks you to sign in                     | Both CLI and app must share the same Expo account              | `npx expo login` and sign into Expo Go with the same credentials              |

---

## Useful Commands

```bash
# Install dependencies
npm install

# Start Metro (Expo Go)
npx expo start

# Start Metro (dev client)
npx expo start --dev-client

# Start Metro with a tunnel (dev client)
npx expo start --dev-client --tunnel

# Clear Metro cache
npx expo start --dev-client --clear

# Generate native projects (iOS/Android)
npx expo prebuild

# Install/update dev client on simulator
npx expo run:ios --simulator "iPhone 15"

# Install/update dev client on a connected iPhone
npx expo run:ios --device

# Check Expo account in CLI
npx expo whoami

# Login/out of Expo
npx expo login
npx expo logout
```

---

With these steps documented you can:

- Prototype UI quickly in Expo Go,
- Switch to a dev build when you need native modules (voice input),
- Test on simulator or physical hardware,
- Keep network configuration straight, and
- Troubleshoot the common Expo + React Native gotchas.

Happy building!
