# Task 10 — Tests & Docs

**Owner:** subagent-qa · **Depends on:** task-02..task-09 · **Parallel with:** none (last)

## Objective
Add automated tests for pure logic and update documentation.

## Tests to add (`__tests__/`, mirror src layout)
- `data/mapping.test.ts` — snake_case→camelCase row mapping; `AddVisitPayload` shape.
- `validation/visitSchema.test.ts` — valid payload passes; missing name / empty items / bad rating fail.
- `validation/authSchema.test.ts` — email/password rules; signup confirm-password mismatch fails.
- `services/places/osmPlacesService.test.ts` — parse a mocked Overpass response into sorted `PlaceCandidate[]`; empty/error → `[]`.
- `utils/geo.test.ts` — haversine distance sanity checks.

Mock network (`fetch`), geolocation, and the Supabase client via `jest.mock`. Do not hit real services in unit tests.

## Manual / integration checks (document in README)
- Two-user RLS check: user B cannot see user A's restaurants.
- Session persists across app restart.

## Docs to update
- Root `README.md`: Architecture section linking `docs/plans/`; setup steps (create Supabase project, run `supabase/migrations`, fill `src/config/env.ts`, location permissions, OSM User-Agent, no maps key needed).
- `docs/plans/00-overview.md`: flip status to **In progress / Done** as work lands.
- `docs/sessions/`: append a session log entry summarizing execution.

## Acceptance criteria
- `npm test` passes; `npm run lint` clean.
- README explains setup (Supabase + env) and where the plan/architecture live.
