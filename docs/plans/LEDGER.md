# Feature & Task Ledger

**Single source of truth** for the project: every feature, its tasks, their status, and the optional
future work (nice-to-haves) not yet implemented. **Keep this file updated** whenever work starts/lands
or scope changes.

Last updated: 2026-06-27 · Stack: React Native + Supabase + OSM · Scope: mobile-only

Status legend: `⬜ Not started` · `🟨 Scaffolded/partial` · `🟦 In progress` · `✅ Done`

---

## Features (current scope: first core requirement)

### Feature 1 — Project Foundation
App shell, dependencies, config, navigation.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-01 — Dependencies, config & Supabase client](./tasks/task-01-dependencies-and-supabase-client.md) | ✅ Done | Deps installed; env config + `dotenv.d.ts` (@env types fixed); `src/lib/supabase.ts` created; iOS/Android location permissions added. ⚠️ `pod install` still pending (CocoaPods not available in this env) — run before an iOS build. |
| [task-07 — Navigation + app shell (auth-gated)](./tasks/task-07-navigation-app-shell.md) | ⬜ Not started | AuthStack vs AppStack; removes default RN screen. |

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
| [task-08 — Add Visit form screen](./tasks/task-08-add-visit-form.md) | ⬜ Not started | GPS + name autofill, dynamic items, atomic save. |

### Feature 6 — Lookup Past Orders
View a user's history per restaurant.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-09 — Lookup screen](./tasks/task-09-lookup-screen.md) | ⬜ Not started | **Virtualized FlatList + infinite-scroll pagination.** |

### Feature 7 — Quality (tests & docs)
Automated tests + documentation.

| Task | Status | Notes |
| ---- | ------ | ----- |
| [task-10 — Tests & docs](./tasks/task-10-testing-docs.md) | ⬜ Not started | Unit tests for pure logic; README/docs update. |

---

## Cross-cutting requirements (folded into the tasks above)

| Requirement | Where | Status |
| ----------- | ----- | ------ |
| List **virtualization** (FlatList/SectionList, no ScrollView+map) | task-09 (+ future lists) | ⬜ Planned |
| **Pagination** (data `Page<T>` + UI `onEndReached` load-more) | task-06 + task-09 | ⬜ Planned |

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
| **Web + desktop targets** (RN Web/Expo, Electron/Tauri) | Scope is mobile-only; expanding platforms is optional/future. |

---

## Maintenance rules
- This file is the **master tracker** — update it on every status change.
- Starting a task → `🟦 In progress`; merged + acceptance met → `✅ Done` (note the date/PR).
- New feature → add a `### Feature N` section with its task rows.
- Picking up a backlog/optional item → create `tasks/task-NN-*.md`, move the row into its feature section.
- Keep in sync with [README.md](./README.md) and [00-overview.md](./00-overview.md).
