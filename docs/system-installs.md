# System-wide installs (for cleanup)

Tracks tools/artifacts installed **outside this repo** while building RestaurantProject, so they can
be removed later. Project-local things (e.g. `node_modules/`, `ios/Pods/`, `android/.gradle`,
`android/app/build`) are NOT listed here — they vanish when the repo is deleted.

Last updated: 2026-06-27.

---

## Installed by Claude for this project (safe to remove when done)

| Item | What / where | Remove with | Caveat |
| ---- | ------------ | ----------- | ------ |
| **Android command-line tools** | Homebrew cask `android-commandlinetools` (provides `sdkmanager`) | `brew uninstall --cask android-commandlinetools` | Installed to get `sdkmanager`; separate from your Android Studio SDK. |
| **Android NDK** `27.1.12297006` | `~/Library/Android/sdk/ndk/27.1.12297006` | `sdkmanager --uninstall "ndk;27.1.12297006"` (or delete the folder) | Required by RN's native build. Other RN projects may reuse it. |
| **Android CMake** `3.22.1` | `~/Library/Android/sdk/cmake/3.22.1` | `sdkmanager --uninstall "cmake;3.22.1"` (or delete the folder) | Shared across native Android builds. |

> Update this table as more system-wide installs happen.

## Build side-effects (caches — optional to clear, shared)

| Item | Where | Note |
| ---- | ----- | ---- |
| Gradle distribution + dependency cache | `~/.gradle/` | **Shared** with your other Gradle/Java projects — do NOT delete wholesale. |
| Gradle daemon | background JVM | `./gradlew --stop` to stop daemons. |

## Keep — installed by this project but NOT to be removed (per user)

- **GitHub CLI (`gh`)** — installed via Homebrew for pushing the repo. User wants to keep it; do **not** uninstall.

## Pre-existing — DO NOT remove (yours, not installed by this project)

- **Android Studio** + **Android SDK** (`~/Library/Android/sdk`): platforms, build-tools, emulator,
  AVDs (`Medium_Phone`, `Medium_Phone_2`), system image `android-36`. Installed by you for another project.
- **JDK 17**, **Homebrew**, **Node.js / npm**.

---

## Quick cleanup (when the project is done)

```sh
# 1) Remove the NDK/CMake installed for this project (skip if other RN apps need them)
"$HOME/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager" --uninstall "ndk;27.1.12297006" "cmake;3.22.1"

# 2) Remove the Android command-line tools cask (sdkmanager)
brew uninstall --cask android-commandlinetools

# NOTE: keep `gh` (GitHub CLI) — do not uninstall (per user).

# 3) Stop any Gradle daemon started by builds
(cd /Users/brijesh/RestaurantProject/android && ./gradlew --stop)

# 4) Delete the repo to remove all project-local artifacts (node_modules, build dirs, Pods)
```

Ask me to "clean up system installs" and I'll run the applicable steps and update this file.
