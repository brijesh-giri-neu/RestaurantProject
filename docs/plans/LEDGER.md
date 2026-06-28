# Feature & Task Ledger

**Single source of truth** for the project: every feature, its tasks, their status, and the optional
future work (nice-to-haves) not yet implemented. **Keep this file updated** whenever work starts/lands
or scope changes.

Last updated: 2026-06-28 (web target) · Stack: React Native + Supabase + OSM · Scope: mobile (iOS + Android) + web (react-native-web + Vite); desktop still out of scope
Status: **all v1 tasks (01–10) implemented** — pending live setup (apply migrations, fill `.env`, `pod install`) before running on device.

Status legend: `⬜ Not started` · `🟨 Scaffolded/partial` · `🟦 In progress` · `✅ Done`

---

## Features (current scope: first core requirement)

### Feature 1 — Project Foundation
App shell, dependencies, config, navigation.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-01 — Dependencies, config & Supabase client](./tasks/task-01-dependencies-and-supabase-client.md) | ✅ Done | Deps installed; env config + `dotenv.d.ts` (@env types fixed); `src/lib/supabase.ts` created; iOS/Android location permissions added. ⚠️ `pod install` still pending (CocoaPods not available in this env) — run before an iOS build. |
| [task-07 — Navigation + app shell (auth-gated)](./tasks/task-07-navigation-app-shell.md) | ✅ Done | App root + auth-gated RootNavigator (AuthStack/AppStack), ScreenContainer; entry registers src/app/App; default screen removed. |

### Feature 2 — Authentication (login / signup)
Email/password auth, session persistence, per-user identity.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-05 — Auth: login/signup + context](./tasks/task-05-auth-login-signup.md) | ✅ Done | `AuthProvider`/`useAuth`, zod validation, Login/Signup screens (use `@hookform/resolvers`). Navigation wiring done in task-07. |

### Feature 3 — Cloud Data & Persistence
Postgres schema, per-user security, typed data access.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-02 — Supabase schema, RLS & RPC](./tasks/task-02-supabase-schema-and-rls.md) | ✅ Done (authored) | Migrations `0001`–`0003` + `supabase/README.md` created. ⚠️ Must be **applied to the live Supabase project** (`supabase db push` or SQL editor) before the app can read/write. |
| [task-06 — Data access layer (Supabase)](./tasks/task-06-data-access-layer.md) | ✅ Done | Typed `src/data` with mappers, `addVisitWithItems` (RPC), paginated `listRestaurants`/`historyForRestaurant` (`Page<T>`). |

### Feature 4 — Location & Restaurant Autofill
GPS capture + nearby-restaurant suggestions.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-03 — Location / GPS service](./tasks/task-03-location-service.md) | ✅ Done | `requestLocationPermission` + `getCurrentLocation()` (typed errors). |
| [task-04 — OSM places autofill service](./tasks/task-04-places-osm-service.md) | ✅ Done | `placesService` (Overpass + Nominatim) behind `PlacesService`; `geo.ts` haversine. See F2 backlog (rate-limit hardening). |

### Feature 5 — Log a Visit (form)
The core data-entry flow.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-08 — Add Visit form screen](./tasks/task-08-add-visit-form.md) | ✅ Done | GPS + OSM autofill, dynamic items (useFieldArray + zod), atomic save, navigates to Lookup. |

### Feature 6 — Lookup Past Orders
View a user's history per restaurant.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-09 — Lookup screen](./tasks/task-09-lookup-screen.md) | ✅ Done | Searchable restaurant list + per-restaurant history; virtualized FlatLists, infinite scroll, refresh on focus. |

### Feature 7 — Quality (tests & docs)
Automated tests + documentation.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-10 — Tests & docs](./tasks/task-10-testing-docs.md) | ✅ Done | 5 unit-test suites (mapping, visit/auth schemas, OSM parsing, geo) — 35 tests green; README updated for Supabase setup. |

---

## v2 — additional screens & features (planned)

Discussed enhancements beyond the first requirement. Depend on v1 (all done).

### Feature 8 — Home & navigation hub
| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-11 — Home screen & nav hub](./tasks/task-11-home-screen.md) | ✅ Done | Home is initial route → Add Visit / Browse / Lookup. |

### Feature 9 — Browse / edit / delete visits
| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-12 — Browse past visits](./tasks/task-12-browse-visits.md) | ✅ Done | `data.listVisits`; virtualized, paginated, refresh on focus; row → edit. |
| [task-13 — Edit a visit](./tasks/task-13-edit-visit.md) | ✅ Done | Shared `VisitForm`; `getVisit` + `updateVisitWithItems` RPC (migration 0004). |
| [task-14 — Delete a visit](./tasks/task-14-delete-visit.md) | ✅ Done | `data.deleteVisit` with confirmation in Browse + Edit; items cascade. |

### Feature 10 — Search (restaurants + dishes)
| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-15 — Search restaurants & dishes](./tasks/task-15-search-restaurants-and-dishes.md) | ✅ Done | `data.searchDishes` + Dishes section in Lookup; tap → edit. (pg_trgm index deferred.) |

### Feature 11 — UI layout overhaul
Cross-screen layout/structure fixes (no feature/behavior changes). Introduces a shared layout foundation so spacing, radii, and palette stop drifting per-file.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Shared layout foundation | ✅ Done | `src/shared/theme` tokens (spacing scale, radii, typography, centralized existing palette) + primitives `FormScreen`, `Field`, `Card`, `Row`; `ScreenContainer` gains `padded`. |
| Keyboard-safe forms | ✅ Done | Auth + visit form wrapped in `FormScreen` (KeyboardAvoidingView + ScrollView) so the submit button/notes/Delete no longer hide behind the keyboard. |
| Lookup single-scroll | ✅ Done | Removed the 50/50 `flex:1` split; Restaurants FlatList keeps pagination, Dishes render as `ListFooterComponent` (no nested VirtualizedList). |
| Card hierarchy & item rows | ✅ Done | Browse rows rebuilt as `Card` + `Row` with a lighter Delete; `OrderedItemRow` puts Price + Rating side-by-side in a compact card. |
| Home & nav chrome | ✅ Done | Home gets a primary action + secondary cards; nav header + Sign-out tokenized. |

### Feature 12 — Web target (react-native-web + Vite)
Runs the same app (`src/app/App.tsx`) in the browser via react-native-web, bundled by Vite. Mobile (Metro) is unchanged; web is an additive build alongside iOS/Android.

| Task | Status | Notes |
| ---- | ------ | ----- |
| Vite + RN-web build config | ✅ Done | `vite.config.mjs`: `@vitejs/plugin-react`; `.web.*` extension priority (mirrors Metro); alias `react-native`→`react-native-web`; `define` for `global`/`__DEV__`; `optimizeDeps` JSX loader for RN-web `.js`. Scripts `npm run web` (dev) / `npm run web:build`; deps `react-dom`, `react-native-web`, `vite`, `@vitejs/plugin-react`, `vite-plugin-commonjs`. |
| Web entry (index.html / index.web.js) | ✅ Done | `index.html` + `index.web.js` mount the **same** `src/app/App.tsx` via `AppRegistry` into `#root` — no app-code fork. |
| Location web shims | ✅ Done | `src/services/location/permissions.web.ts` + `locationService.web.ts` use browser `navigator.geolocation`; native `react-native-geolocation-service` / `PermissionsAndroid` files are excluded from the web bundle by `.web.ts` resolution. |
| `@env` / url-polyfill web shims | ✅ Done | `web/env-shim.ts` bridges `@env` to Vite `import.meta.env` (via `envPrefix` `SUPABASE_`/`OSM_`); `web/empty.ts` no-ops `react-native-url-polyfill/auto` (browser provides URL). |
| AsyncStorage web session persistence | ✅ Done | `@react-native-async-storage/async-storage` resolves to its web (IndexedDB/localStorage) backend, so Supabase session persistence works on web. |
| TypeScript config DOM-aware for web | ✅ Done | `tsconfig.json` includes DOM lib + `vite/client` types so `tsc` is clean over the web files (`import.meta.env`, `document`, `navigator`). |

---

## Cross-cutting requirements (folded into the tasks above)

| Requirement | Where | Status |
| ----------- | ----- | ------ |
| List **virtualization** (FlatList/SectionList, no ScrollView+map) | task-09 (+ future lists) | ✅ Done |
| **Pagination** (data `Page<T>` + UI `onEndReached` load-more) | task-06 + task-09 | ✅ Done |

---

## Future backlog (deferred — intended, not in v1)

Things we discussed that are planned for later. Promote to a task file when picked up.

| # | Item | Why deferred | Trigger |
| - | ---- | ------------ | ------- |
| F1 | **Client caching with TanStack Query** | Plain hooks suffice for v1. | When refetch boilerplate hurts / repeated fetches slow UX. |
| F2 | **OSM rate-limit hardening** (cache, reuse known restaurants, proxy via Edge Function) | Public OSM throttles under concurrent users — #1 scaling risk. | Before real multi-user traffic. |
| F3 | **Swap `PlacesService` to paid/self-hosted** (Google/Mapbox/self-hosted Nominatim) | Free OSM won't scale. | If F2 caching isn't enough. |
| F4 | **Keyset pagination + `user_id`-leading composite indexes** | Offset pagination fine at current volume. | When per-user data gets large/slow. |
| F5 | **PostGIS proximity dedup** | Haversine fine for hundreds/user. | If a user has thousands of restaurants. |
| F6 | **Supabase free → Pro** | Free tier pauses on inactivity. | Before launch to real users. |
| F7 | **Custom SMTP for auth emails** | Built-in email rate-limited. | When signup volume grows. |

---

## Optional / nice-to-haves (discussed, not planned)

Optional work we discussed but did not commit to — may never be built.

| Item | Why optional |
| ---- | ------------ |
| **Offline support / sync** | Nice-to-have UX (log with no signal); hard, not default in RN/Supabase. Deferred indefinitely. |
| **Social login (Google/Apple)** | Email/password chosen for v1; social sign-in is optional polish. |
| **Desktop target** (Electron/Tauri) | Web is now implemented (see Feature 12); a packaged desktop shell remains optional/future. |

---

## Maintenance rules
- This file is the **master tracker** — update it on every status change.
- Starting a task → `🟦 In progress`; merged + acceptance met → `✅ Done` (note the date/PR).
- New feature → add a `### Feature N` section with its task rows.
- Picking up a backlog/optional item → create `tasks/task-NN-*.md`, move the row into its feature section.
- Keep in sync with [README.md](./README.md) and [00-overview.md](./00-overview.md).
