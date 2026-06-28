# Task 15 — Search by Restaurant Name and Dish

**Owner:** subagent-search · **Depends on:** task-06 (data), task-09/task-12 (a screen to host search) · **Part of:** v2

## Objective
Search across **restaurant names AND dish (ordered-item) names**. Today search only matches restaurant
names; extend it so typing a dish surfaces where that dish was ordered.

## Data layer (add to `src/data/`)
- `searchRestaurants(term, opts?): Promise<Page<Restaurant>>` — existing `listRestaurants({ search })`
  behavior (ilike on `restaurants.name`).
- `searchDishes(term, opts?): Promise<Page<DishHit>>` where
  `DishHit = { item: OrderedItem; visit: Visit; restaurant: Restaurant }`:
  - Query `ordered_items` with `.ilike('name', %term%)`, nested `visits(*, restaurants(*))`, paginated,
    newest visit first. Map to camelCase. RLS auto-scopes to the user.
- Optional unified `search(term)` returning `{ restaurants: Restaurant[]; dishes: DishHit[] }`.

## DB (optional performance)
- For large datasets, add `pg_trgm` GIN indexes on `restaurants.name` and `ordered_items.name`
  (`supabase/migrations/0005_search_indexes.sql`). Note as optional; plain `ilike` is fine for v1 volumes.

## UI
- Enhance the existing search (Lookup) **or** add a dedicated `SearchScreen` with a single query box and
  two result sections: **Restaurants** and **Dishes** (each a virtualized list).
- Tapping a restaurant → its history (Lookup); tapping a dish → its visit (EditVisit/detail).
- Debounce input; show empty/no-results states.

## Acceptance criteria
- Searching a dish name returns the restaurants/visits where it was ordered.
- Searching a restaurant name returns matching restaurants.
- Results virtualized + paginated; reads only through `data`; `tsc` clean.
