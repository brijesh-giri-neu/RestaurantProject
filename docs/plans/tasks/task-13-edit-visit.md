# Task 13 — Edit a Visit

**Owner:** subagent-edit · **Depends on:** task-12 (browse entry), task-08 (visit form) · **Part of:** v2

## Objective
Edit an existing visit: its notes, date, and its ordered items (add / remove / change), saved atomically.

## DB / migration
- `supabase/migrations/0004_update_visit_with_items.sql` — RPC
  `update_visit_with_items(payload jsonb)` that, for a visit owned by `auth.uid()`:
  - updates `visits.visited_at` / `visits.notes`,
  - replaces its items: `delete from ordered_items where visit_id = ...` then re-insert from `payload.items`,
  - all in one transaction; returns `{ visitId }`.
  - Runs as caller (RLS applies); verify the visit belongs to the user before mutating.
- Update `supabase/README.md` to include applying `0004`.

## Data layer
- `src/data/updateVisitWithItems.ts` — `updateVisitWithItems(visitId, payload)` calling the RPC.
- `src/data/visits.ts` — `getVisit(visitId): Promise<VisitWithContext>` to load a visit for editing.

## Files to create / refactor
- **Refactor the visit form**: extract the shared form UI/logic from task-08's `AddVisitScreen` into a
  reusable `VisitForm` (e.g. `src/features/visits/components/VisitForm.tsx`) used by both Add and Edit,
  to avoid duplication.
- `src/features/visits/screens/EditVisitScreen.tsx` — register as `EditVisit { visitId }`; loads the
  visit via `getVisit`, prefills the form, submits via `updateVisitWithItems`, returns to Browse.

## Acceptance criteria
- Editing a visit's notes/date/items persists; Browse and Lookup reflect the changes.
- Item add/remove during edit works; save is atomic (RPC).
- `tsc` clean; screen reads/writes only through `data`.
