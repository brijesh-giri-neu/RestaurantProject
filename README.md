# RestaurantProject

A cross-platform mobile app, built with [React Native](https://reactnative.dev) (v0.86.0) and TypeScript, for **tracking the restaurants you visit and the items you order**, backed by [Supabase](https://supabase.com) (Postgres + Auth + Row Level Security).

## Goal

Collect and persist data about:

- **Visited restaurants** — name, location, date of visit, notes/ratings
- **Ordered items** — dishes ordered at each visit, price, rating

Data is stored per-user in Supabase (isolated by Row Level Security) so you can build up a personal history of where you've eaten and what you've ordered. Nearby-restaurant autofill comes from OpenStreetMap (Overpass + Nominatim).

## Architecture

The implementation plan and architecture live under [`docs/plans/`](docs/plans/):

- [`docs/plans/architecture.md`](docs/plans/architecture.md) — folder structure, module boundaries, and the interface contracts between layers.
- [`docs/plans/`](docs/plans/) — the overview and the per-task plans (`docs/plans/tasks/`).

High level:

- **Feature-first** code under `src/features/<feature>`; cross-cutting code under `src/shared`, `src/services`, `src/data`, `src/config`, `src/lib`.
- Screens never touch the Supabase client, `fetch`, or geolocation directly — they go through **services** (`src/services`), **data-access modules** (`src/data`), and **hooks**, exposed via barrel `index.ts` files.
- **Security is in the database:** per-user isolation is enforced by Row Level Security, not client code. The app uses only the Supabase publishable key, never the secret key.
- **Pure logic is unit-tested** under `__tests__/` (validation, snake_case→camelCase mappers, geo/haversine, OSM response parsing). Native modules are mocked so tests run in Node.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Watchman](https://facebook.github.io/watchman/) (recommended on macOS)
- **iOS:** Xcode, CocoaPods, Ruby/Bundler
- **Android:** Android Studio, JDK 17, an emulator or device

See the official [React Native environment setup](https://reactnative.dev/docs/environment-setup) guide for details.

## Getting Started

### 1. Install JavaScript dependencies

```sh
npm install
```

### 2. Create a Supabase project and run the migrations

1. Create a new project at [supabase.com](https://supabase.com) (free tier is fine).
2. Apply the SQL migrations in order from [`supabase/migrations/`](supabase/migrations/):
   - `0001_init.sql` — tables + indexes
   - `0002_rls.sql` — enable Row Level Security + per-user policies
   - `0003_add_visit_with_items.sql` — transactional `add_visit_with_items` RPC

   You can run them via the Supabase SQL editor (paste each file in order) or with the Supabase CLI (`supabase db push` against a linked project).

### 3. Configure environment variables

Create a **git-ignored** `.env` file in the project root with your project's **public** values (loaded via `react-native-dotenv` and accessed through `src/config/env.ts`):

```sh
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx

# OpenStreetMap (free, no API key required)
OSM_OVERPASS_URL=https://overpass-api.de/api/interpreter
OSM_NOMINATIM_URL=https://nominatim.openstreetmap.org
OSM_USER_AGENT=RestaurantProject/0.1 (contact: you@example.com)
```

Use the **publishable** key (`sb_publishable_...`), never the **secret** key — security is enforced server-side by Row Level Security. OSM/Overpass/Nominatim need no API key, but their usage policy requires a descriptive `User-Agent` (with contact info), which is sent on every request.

### 4. Install native dependencies (iOS)

```sh
cd ios && bundle install && bundle exec pod install && cd ..
```

### 5. Location permission

The app reads the device location to find nearby restaurants. The platform permission prompts are configured in the native projects (iOS `NSLocationWhenInUseUsageDescription` in `Info.plist`; Android `ACCESS_FINE_LOCATION` in `AndroidManifest.xml`). No maps API key is needed.

## Running the App

Start the Metro bundler:

```sh
npm start
```

Then, in a separate terminal, build and launch the app:

```sh
# iOS
npm run ios

# Android
npm run android
```

## Testing & Linting

```sh
npm test          # run Jest unit tests (pure logic; native modules are mocked)
npm run lint      # run ESLint
npx tsc --noEmit  # type-check
```

Unit tests cover pure logic only and live under `__tests__/` (mirroring `src/`): zod validation schemas, row→domain mappers, geo/haversine, and OSM Overpass response parsing. Network (`fetch`), geolocation, AsyncStorage, and the Supabase client are mocked via `jest.mock` — tests never hit real services.

### Manual / integration checks

Some behaviour depends on the live Supabase backend and is verified manually:

- **Per-user isolation (RLS):** sign in as user A and add a restaurant, then sign in as user B — user B must not see user A's restaurants or visits.
- **Session persistence:** sign in, fully restart the app, and confirm the session is restored (no re-login required).

## Data Model

| Entity      | Fields                                                              |
| ----------- | ------------------------------------------------------------------ |
| Restaurant  | id, name, latitude, longitude, address?, osmId?, source, createdAt |
| Visit       | id, restaurantId (FK), visitedAt, notes?                           |
| OrderedItem | id, visitId (FK), name, price?, rating?, notes?                    |

A restaurant has many visits; a visit has many ordered items. See `src/data/types.ts` and `supabase/migrations/` for the authoritative shapes.

## Project Structure

```
.
├── android/        # Native Android project
├── ios/            # Native iOS project
├── src/            # App source (feature-first; see docs/plans/architecture.md)
├── supabase/       # SQL migrations (schema, RLS, RPC)
├── docs/plans/     # Architecture + task plans
├── __tests__/      # Jest test files (mirror src/)
├── index.js        # App entry point (registers src/app/App.tsx)
└── package.json    # Scripts and dependencies
```

## License

Private — all rights reserved.
