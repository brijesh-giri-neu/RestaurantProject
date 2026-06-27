# Task 09 — Lookup Screen

**Owner:** subagent-lookup · **Depends on:** task-06, task-07 · **Parallel with:** task-08

## Objective
View the logged-in user's past ordered items at a given restaurant.

## Files to create
- `src/features/visits/hooks/useRestaurantHistory.ts` — paginated restaurants list +
  `historyFor(restaurantId)` using `data.listRestaurants()` and `data.historyForRestaurant()`.
  - Track `offset`/`nextOffset`, expose `loadMore()` and `refresh()`, accumulate `rows`, expose
    `loadingMore` / `hasMore`.
- `src/features/visits/screens/LookupScreen.tsx` — replaces task-07 placeholder:
  - Searchable/selectable restaurant list (filter by name; passes `search` to the data layer).
  - On select: visits (newest first), each expandable to its ordered items (name, price, rating).
  - Empty states: no restaurants yet / no items.

## Virtualization & pagination (required)
- Use **`FlatList`** (or `SectionList`) for both the restaurant list and the visit history — these are
  virtualized by default (only on-screen rows render). Do **not** use `ScrollView` + `.map()`.
- **Infinite scroll:** wire `onEndReached` → `loadMore()` (fetch next page via the data layer's
  `Page<T>` / `nextOffset`); show a footer spinner while `loadingMore`; stop when `hasMore` is false.
- Tune `onEndReachedThreshold` (~0.5) and provide `keyExtractor`.

## Behaviour
- Pick a restaurant → see items ordered there, grouped by visit date, loading more as you scroll.
- Refresh on focus (`useFocusEffect`) so newly added visits appear.

## Acceptance criteria
- Selecting a restaurant created via Add Visit shows the items ordered.
- Lists are rendered with a **virtualized** FlatList/SectionList and **paginate** via `onEndReached` (no full-table fetch).
- Grouped by visit date, newest first; empty + end-of-list handled gracefully.
- Reads only through `data`/hooks (no direct Supabase in the component).
