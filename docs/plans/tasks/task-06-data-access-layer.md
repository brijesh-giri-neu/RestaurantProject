# Task 06 — Data Access Layer (Supabase)

**Owner:** subagent-data · **Depends on:** task-01, task-02 · **Parallel with:** task-03, task-04, task-05

## Objective
Implement typed, Supabase-backed data access per the contracts in [architecture.md](../architecture.md).
RLS auto-scopes everything to the current user; no manual `user_id` filtering needed in queries.

## Files to create
- `src/data/types.ts` — `Restaurant`, `Visit`, `OrderedItem` (uuid string ids); plus row-mapping helpers (snake_case → camelCase).
- `src/data/addVisitWithItems.ts`
  ```ts
  export async function addVisitWithItems(payload: AddVisitPayload): Promise<{ restaurantId: string; visitId: string }> {
    const { data, error } = await supabase.rpc('add_visit_with_items', { payload });
    if (error) throw error;
    return data as { restaurantId: string; visitId: string };
  }
  ```
  where `AddVisitPayload = { restaurant: {name,latitude,longitude,address?,osmId?,source}, visitedAt?, notes?, items: Array<{name,price?,rating?,notes?}> }`.
- `src/data/restaurants.ts` — **paginated** list:
  ```ts
  export type Page<T> = { rows: T[]; nextOffset: number | null };
  export async function listRestaurants(opts?: { limit?: number; offset?: number; search?: string }): Promise<Page<Restaurant>>;
  ```
  - Default `limit = 20`. Use Supabase `.range(offset, offset + limit - 1)`, `.order('name')`, optional
    `.ilike('name', %search%)`. Return `nextOffset = rows.length === limit ? offset + limit : null`.
- `src/data/visits.ts` — **paginated** history:
  ```ts
  export async function historyForRestaurant(restaurantId: string, opts?: { limit?: number; offset?: number }): Promise<Page<{ visit: Visit; items: OrderedItem[] }>>;
  ```
  - Query visits for the restaurant (newest first, `visited_at desc`) with nested `ordered_items(*)`
    via relation select, `.range(...)`, map to camelCase, return a `Page<...>`.
- `src/data/index.ts` — barrel (export `Page<T>` too).

## Pagination notes
- Offset pagination is fine for this app's volume; can switch to keyset (cursor on `visited_at`/`id`)
  later for very large datasets without changing call sites much.
- `limit` is the page size the UI requests on scroll (see task-09 "load more").

## Acceptance criteria
- `addVisitWithItems` persists restaurant (deduped) + visit + items atomically via the RPC.
- `listRestaurants` / `historyForRestaurant` return **paginated** (`Page<T>`), typed, camelCased data scoped to the user (RLS).
- All Supabase access is confined to `src/data` (+ auth in task-05); errors are thrown for callers to handle.
- No `any` at the boundary; unit tests for mapping/pagination shape added in task-10.
