# Task 12 — Browse Past Visits

**Owner:** subagent-browse · **Depends on:** task-06 (data), task-11 (Home + nav routes) · **Part of:** v2

## Objective
A screen listing ALL of the user's visits (across every restaurant), newest first, paginated and
virtualized, as the entry point to view / edit / delete a visit.

## Data layer (add to `src/data/visits.ts`)
- `listVisits(opts?: { limit?: number; offset?: number; search?: string }): Promise<Page<VisitWithContext>>`
  where `VisitWithContext = { visit: Visit; restaurant: Restaurant; items: OrderedItem[] }`.
  - Select visits with nested `restaurants(*)` and `ordered_items(*)`, `.order('visited_at', desc)`, `.range(...)`.
  - `search` (optional) filters by restaurant name (delegate dish search to task-15).
  - Map to camelCase; return `Page<...>` (`nextOffset` as in the existing helpers).

## Files to create
- `src/features/visits/hooks/useVisitsBrowse.ts` — paginated accumulation (`rows`, `loadMore`, `refresh`, `loadingMore`, `hasMore`), like `useRestaurantHistory`.
- `src/features/visits/screens/BrowseVisitsScreen.tsx` — register as `BrowseVisits` in `AppStack`:
  - **Virtualized `FlatList`** of visits; each row: restaurant name, visit date, item count / first items, total price.
  - `onEndReached` → `loadMore`; footer spinner; refresh on focus.
  - Row tap → navigate to `EditVisit { visitId }` (task-13) or a detail view.
  - Empty state when no visits.

## Acceptance criteria
- Lists all of the user's visits, paginated + virtualized, newest first.
- Tapping a visit routes to edit/detail.
- Reads only through `data`/hooks; `tsc` clean.
