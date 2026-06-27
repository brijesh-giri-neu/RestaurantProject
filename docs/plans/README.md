# Plans Index

This folder contains all planning documents for **RestaurantProject**, structured so that
individual tasks can be handed to **subagents** to execute in parallel/sequence.

Backend: **Supabase** (Postgres + Auth + RLS) · Scope: **mobile only** for now.

## Documents

| File | Purpose |
| ---- | ------- |
| [00-overview.md](./00-overview.md) | Master plan: goal, scope, decisions, data model, phases |
| [architecture.md](./architecture.md) | Folder structure + modular design decisions + module contracts |
| [LEDGER.md](./LEDGER.md) | Task status ledger + future-work backlog (source of truth for progress) |
| [tasks/](./tasks/) | One self-contained task file per unit of work (subagent-assignable) |

## Task list & dependency order

| ID | Task | Depends on |
| -- | ---- | ---------- |
| [task-01](./tasks/task-01-dependencies-and-supabase-client.md) | Dependencies, config & Supabase client | — |
| [task-02](./tasks/task-02-supabase-schema-and-rls.md) | Supabase schema, RLS & RPC | (needs a Supabase project) |
| [task-03](./tasks/task-03-location-service.md) | Location/GPS service | task-01 |
| [task-04](./tasks/task-04-places-osm-service.md) | OSM places autofill service | task-01 |
| [task-05](./tasks/task-05-auth-login-signup.md) | Auth: login/signup + context | task-01 |
| [task-06](./tasks/task-06-data-access-layer.md) | Data access layer (Supabase) | task-01, task-02 |
| [task-07](./tasks/task-07-navigation-app-shell.md) | Navigation + app shell (auth-gated) | task-05 |
| [task-08](./tasks/task-08-add-visit-form.md) | Add Visit form screen | task-03, task-04, task-06, task-07 |
| [task-09](./tasks/task-09-lookup-screen.md) | Lookup screen | task-06, task-07 |
| [task-10](./tasks/task-10-testing-docs.md) | Tests & docs | task-02 through task-09 |

## How to assign a task to a subagent

Each task file is self-contained. To dispatch one:

1. Give the subagent the **contents of the task file** plus [architecture.md](./architecture.md).
2. Instruct it to stay **strictly inside `/Users/brijesh/RestaurantProject`**.
3. Require it to satisfy the task's **Acceptance criteria** and report the files it changed.

Suggested parallel waves:
- **Wave 1:** task-01 (deps + Supabase client). In parallel, developer creates the Supabase project and runs task-02 SQL.
- **Wave 2:** task-03, task-04, task-05, task-06 (independent modules — location, places, auth, data).
- **Wave 3:** task-07 (navigation/app shell, needs auth), then task-08, task-09 (screens).
- **Wave 4:** task-10 (tests + docs).
