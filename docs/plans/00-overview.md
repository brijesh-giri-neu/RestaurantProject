# Master Plan — Restaurant Visit Logging (First Core Requirement)

Status: **Planned** · Created: 2026-06-27 · Stack: React Native 0.86 (new arch) + TypeScript · Backend: **Supabase**

## Goal

A form-driven flow, **per authenticated user**, to log a restaurant visit:

- **Login / Signup** (email + password) via Supabase Auth.
- Auto-fill **GPS location** from the device.
- Auto-fill / suggest the **restaurant name** from a maps API (**free OpenStreetMap**).
- Capture **ordered items** (name, price, rating, notes).
- Persist everything to the **cloud (Supabase / Postgres)**, scoped to the logged-in user.
- A **Lookup** screen to view that user's past ordered items at a given restaurant.

Scope now: **mobile only** (iOS + Android). Web/desktop deferred.

## Key decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Backend | **Supabase** (Postgres + Auth + RLS) | No server to build/host; relational model fits restaurant→visit→items; auth built in; low lock-in (plain Postgres). |
| Auth | **Email + password** (Supabase Auth) | Simplest first workflow; session persisted on device. Social login later. |
| Per-user data | **Row Level Security** (`user_id = auth.uid()`) | Each user only sees their own rows; enforced in DB, not client. |
| Maps provider | **OpenStreetMap** (Overpass nearby + Nominatim reverse-geocode) | No API key/billing; abstracted behind `PlacesService`. |
| Geolocation | **react-native-geolocation-service** | Reliable GPS + permissions. |
| Navigation | **@react-navigation/native** + native-stack | Auth-gated: Auth stack vs App stack. |
| Forms | **react-hook-form** + **zod** | Dynamic item list + typed validation. |

> All external access (Supabase client, GPS, places) is wrapped behind module boundaries; screens
> depend on services/data-access + hooks, never the SDK directly. See [architecture.md](./architecture.md).

**Performance:** lists use **virtualized** `FlatList`/`SectionList` and the data layer is **paginated**
(`Page<T>` + `.range()`, infinite scroll). Client caching (TanStack Query), OSM rate-limit hardening,
and offline sync are **deferred** — tracked in [LEDGER.md](./LEDGER.md).

## What the developer must provide (one-time)

- Create a free **Supabase project** → put **Project URL** + **publishable key** into the git-ignored `.env` (read via `src/config/env.ts`).
- Run the SQL in `supabase/migrations/` (schema + RLS + `add_visit_with_items` function) via the Supabase SQL editor (or CLI).
- The **publishable key** (`sb_publishable_...`) is client-safe; the **secret key** (`sb_secret_...`) is never used in the app.

## Data model (Postgres / Supabase)

```
restaurants   (id uuid PK, user_id uuid→auth.users, name, latitude, longitude, address, osm_id, source, created_at)
visits        (id uuid PK, user_id, restaurant_id→restaurants, visited_at, notes)
ordered_items (id uuid PK, user_id, visit_id→visits, name, price, rating, notes)
```

- Every table has `user_id` (default `auth.uid()`) and **RLS** restricting all access to the owner.
- Restaurant **deduped** per user by `(user_id, osm_id)` when available, else GPS proximity (~50 m).
- Atomic save via a Postgres function **`add_visit_with_items(payload jsonb)`** (upsert restaurant + insert visit + items in one transaction), called from the app with `supabase.rpc`.
- **Lookup** = select restaurant → join visits → ordered_items for that restaurant (RLS auto-scopes to user).

## Phases → tasks

| Phase | Task file |
| ----- | --------- |
| 1. Dependencies, config & Supabase client | [task-01](./tasks/task-01-dependencies-and-supabase-client.md) |
| 2. Supabase schema, RLS & RPC | [task-02](./tasks/task-02-supabase-schema-and-rls.md) |
| 3. Location/GPS service | [task-03](./tasks/task-03-location-service.md) |
| 4. OSM places autofill | [task-04](./tasks/task-04-places-osm-service.md) |
| 5. Auth (login/signup + context) | [task-05](./tasks/task-05-auth-login-signup.md) |
| 6. Data access layer (Supabase) | [task-06](./tasks/task-06-data-access-layer.md) |
| 7. Navigation + app shell (auth-gated) | [task-07](./tasks/task-07-navigation-app-shell.md) |
| 8. Add Visit form screen | [task-08](./tasks/task-08-add-visit-form.md) |
| 9. Lookup screen | [task-09](./tasks/task-09-lookup-screen.md) |
| 10. Tests & docs | [task-10](./tasks/task-10-testing-docs.md) |

## End-to-end acceptance (definition of done)

1. New user can **sign up**, **log out**, and **log back in**; session persists across app restart.
2. Logged in → **Add Visit**: GPS auto-fills; OSM suggests a restaurant name (editable); add items; submit.
3. Submit stores restaurant (deduped) + visit + items in Supabase, tagged with the user.
4. **Lookup**: pick a restaurant → see that user's past items, grouped by visit date.
5. A second user sees **only their own** data (RLS verified).
6. Repository/validation/places unit tests pass (`npm test`).
