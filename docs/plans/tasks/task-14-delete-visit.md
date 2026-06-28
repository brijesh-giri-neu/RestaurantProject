# Task 14 — Delete a Visit

**Owner:** subagent-delete · **Depends on:** task-12 (browse) · **Part of:** v2

## Objective
Let a user delete a visit (with confirmation). Its ordered items are removed too.

## Data layer
- `src/data/visits.ts` — `deleteVisit(visitId: string): Promise<void>`
  - `supabase.from('visits').delete().eq('id', visitId)` (RLS restricts to owner; `ordered_items`
    cascade-delete via the FK from migration 0001). Throw on error.

## UI
- Add a **Delete** affordance in `BrowseVisitsScreen` (row swipe action or a button in the row/detail)
  and/or in `EditVisitScreen`.
- Confirm with a native `Alert` ("Delete this visit? This can't be undone.") before deleting.
- On success, remove the row from the list (refresh) and, if on Edit, navigate back.

## Acceptance criteria
- Deleting a visit removes it from Browse and Lookup; its items are gone (cascade verified).
- Deletion is confirmed first; errors surfaced.
- Reads/writes only through `data`; `tsc` clean.
