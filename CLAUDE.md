# CLAUDE.md

Guidance for Claude Code (and any contributor) working in this repository.

---

## Project overview

**RestaurantProject** is a cross-platform mobile app (React Native) for logging the restaurants a
user visits and the items they order, with a per-restaurant lookup of past orders. Data is stored in
the cloud (Supabase) and scoped per authenticated user.

### High-level goals
- Let a logged-in user **log a visit** via a form: auto-filled GPS location, auto-suggested restaurant
  name (from OpenStreetMap), and a list of ordered items (name, price, rating, notes).
- **Persist** everything to Supabase (Postgres), isolated per user via Row Level Security.
- **Look up** a user's past ordered items at any restaurant they've visited.
- Keep the codebase **modular and swappable** (external integrations behind interfaces).

Scope today: **mobile** (iOS + Android) plus a **web** target (react-native-web + Vite) that runs the same app in the browser. Desktop remains out of scope.

---

## System requirements

- **Node.js** ≥ 22.11.0 (per `package.json` `engines`)
- **npm** (lockfile committed)
- **Watchman** (recommended on macOS)
- **React Native** 0.86 (new architecture) + **TypeScript**
- **iOS:** Xcode, CocoaPods, Ruby + Bundler
- **Android:** Android Studio, JDK 17, an emulator or device
- **Supabase** account + project (URL + publishable key in `.env`)

### Tech stack
React Native 0.86 · TypeScript · Supabase (Postgres + Auth + RLS) · React Navigation (native-stack) ·
react-hook-form + zod · react-native-geolocation-service · OpenStreetMap (Overpass + Nominatim) ·
react-native-dotenv · react-native-web + Vite (web target).

### Common commands
```sh
npm start          # Metro bundler
npm run ios        # build & run iOS
npm run android    # build & run Android
npm run web        # Vite dev server (react-native-web)
npm run web:build  # production web build (Vite)
npm test           # Jest
npm run lint       # ESLint
```

---

## System prompt / working agreement

When working in this repo, follow these rules:

1. **Stay inside the project folder** (`/Users/brijesh/RestaurantProject`). No external scratch/temp dirs.
2. **Modular, feature-first structure.** UI under `src/features/<feature>`; cross-cutting code under
   `src/shared`, `src/services`, `src/data`, `src/config`, `src/lib`. External integrations (Supabase,
   GPS, places) live behind interfaces/barrels — screens never import SDKs directly. See
   `docs/plans/architecture.md`.
3. **No secrets in code.** Config comes from the git-ignored `.env` via `src/config/env.ts`. Use the
   Supabase **publishable** key only; never the secret key.
4. **Maintain the ledger.** Keep `docs/plans/LEDGER.md` (features → tasks → status, plus future and
   optional work) up to date on every status change.
5. **Only document discussed scope.** Do not invent features, tasks, or nice-to-haves. Propose ideas
   in chat first; never silently add speculative scope to the docs.
6. **Surgical commits.** Make small, modular commits, one logical change each, with clear messages.
   Do not dump unrelated changes together.
7. **Lists & data:** use virtualized `FlatList`/`SectionList` and paginated data access.

### Authoring & credits (IMPORTANT)
- **Do not author or co-author anything as Claude.** No "Generated with Claude", no
  "Co-Authored-By: Claude" trailers, no Claude attribution in commit messages, code comments, or docs.
- All commits and credits use the repository owner's identity: **Brijesh Giri**
  (configured in git). Author and commit work under that name only.

---

## Where things live
- `docs/plans/00-overview.md` — master plan, goals, data model.
- `docs/plans/architecture.md` — folder structure, module contracts, conventions.
- `docs/plans/LEDGER.md` — feature/task tracker + future + optional work.
- `docs/plans/tasks/` — self-contained, subagent-assignable task files.
- `docs/sessions/` — restorable chat-session logs.
