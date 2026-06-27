# Session — 2026-06-27 — Init & Planning

## Summary
- Initialized a React Native 0.86 (TypeScript, new architecture) repository in `/Users/brijesh/RestaurantProject`.
- Installed JS dependencies; git repo present on branch `main` with initial commits.
- Installed GitHub CLI (`gh`) via Homebrew; **auth pending** (user must run `gh auth login`) — push not yet done.
- Wrote project README reflecting the app goal.
- Created `docs/` structure: plans (master + architecture + 8 subagent task files) and sessions.
- Planned the first core requirement; then user pivoted to **cloud storage + auth** (see Decisions).

## Decisions
- **App goal:** track visited restaurants + ordered items; lookup past items per restaurant.
- **Maps autofill:** free **OpenStreetMap** (Overpass nearby + Nominatim reverse-geocode), behind a swappable `PlacesService` interface.
- **Modularity:** feature-first folders; external integrations (DB, GPS, places, auth) hidden behind interfaces/barrels. See [../plans/architecture.md](../plans/architecture.md).
- **Docs/sessions:** all plans and chat sessions stored as markdown under `docs/` so sessions can be restored and tasks handed to subagents.
- **Cloud + auth:** store data in the **cloud** and implement **login/signup**.
  - Backend = **Supabase** (Postgres + Auth + RLS). Considered Firebase (NoSQL, strong offline, no server) and MongoDB (rejected: needs a custom backend since Mongo's Realm/App Services BaaS is EOL). Chose Supabase for relational fit + no server + low lock-in.
  - Auth = **email/password** first. Scope = **mobile only** for now (web/desktop deferred).
  - Per-user isolation via **Row Level Security**. Developer must create the Supabase project and provide URL + publishable key (client-safe; secret key never used in app).
  - Env vars stored in git-ignored `.env` (via `react-native-dotenv` → `src/config/env.ts`); no `.example` file (removed to avoid clutter).
  - Plan + docs revised from local SQLite to Supabase: 10 task files, new folder structure (`src/lib/supabase.ts`, `src/data`, `src/features/auth`, `supabase/migrations`).

## State (end of session)
- Repo: RN scaffolding + deps installed; default app screen still in place (no feature code yet).
- Docs: `docs/plans/*` and `docs/sessions/*` created. Task files currently describe the **local-SQLite** version and are being revised for cloud + auth.
- Git: committed locally; **not pushed** (gh not authenticated).
- Constraint from user: **stay strictly inside the project folder**.

## Transcript (condensed)
1. User: "Initialize a react native repository" → scaffolded RN 0.86 via community CLI (worked around CLI empty-dir bug using a temp dir, then moved files in); `npm install`.
2. User: "Did you make changes to root folders?" → clarified all additions were new; nothing existing modified.
3. User: "Stick to the current folder only" → acknowledged; saved as a preference.
4. User: "Push to my git. Create a readme." → wrote README; committed; no remote → chose to install `gh`; installed via Homebrew; auth pending.
5. User: "Create a plan for first core requirement" (form, GPS autofill, maps name autofill, DB, lookup) → presented plan; asked maps-provider question → user chose **OpenStreetMap**.
6. User: "Modular structure; store plans + chat sessions as md; enable subagent task assignment" → created `docs/plans` (overview, architecture, 8 task files, index) and `docs/sessions`.
7. User: "Store data in cloud and implement login/signup" → revising plan to cloud + auth (this session ends mid-revision).

## Resume — next action
1. Read this file, then [../plans/00-overview.md](../plans/00-overview.md) and [../plans/architecture.md](../plans/architecture.md).
2. Plan is finalized for **Supabase** (10 tasks in `../plans/tasks/`). Decisions settled: Supabase, email/password, mobile-only.
3. **Developer one-time setup:** create a free Supabase project, run `supabase/migrations/*.sql` (created in task-02), and put URL + publishable key in `.env`.
4. Finish `gh auth login` then push: `gh repo create RestaurantProject --private --source=. --remote=origin --push`.
5. Begin execution: Wave 1 = task-01 (deps + Supabase client) while developer does Supabase setup; then dispatch subagents per [../plans/README.md](../plans/README.md) waves.
