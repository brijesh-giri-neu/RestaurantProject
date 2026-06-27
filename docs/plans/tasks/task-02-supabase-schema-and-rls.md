# Task 02 — Supabase Schema, RLS & RPC

**Owner:** subagent-db · **Depends on:** a Supabase project exists (developer-created)

## Objective
Define the Postgres schema, per-user Row Level Security, and a transactional RPC, as SQL migration
files in the repo, to be run in the Supabase SQL editor / CLI.

## Files to create
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_rls.sql`
- `supabase/migrations/0003_add_visit_with_items.sql`
- `supabase/README.md` — how to apply (SQL editor or `supabase db push`).

## 0001_init.sql
```sql
create extension if not exists pgcrypto;

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  osm_id text,
  source text not null default 'manual' check (source in ('osm','manual')),
  created_at timestamptz not null default now()
);
-- dedup OSM places per user; multiple manual (null osm_id) rows allowed
create unique index restaurants_user_osm_uniq on public.restaurants(user_id, osm_id) where osm_id is not null;
-- listRestaurants: filter user_id (RLS) + order/search by name
create index restaurants_user_name_idx on public.restaurants(user_id, name);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  visited_at timestamptz not null default now(),
  notes text
);
-- historyForRestaurant: filter restaurant_id + order visited_at desc + paginate
create index visits_restaurant_visited_idx on public.visits(restaurant_id, visited_at desc);

create table public.ordered_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  name text not null,
  price numeric(10,2),
  rating int check (rating between 1 and 5),
  notes text
);
-- nested fetch of items per visit
create index ordered_items_visit_idx on public.ordered_items(visit_id);
```

## 0002_rls.sql
Enable RLS on all three tables. Base rule: a user can only touch rows where `user_id = auth.uid()`.
For child tables, the **insert/update `with check` also verifies the parent row is owned by the user**
— this closes the hole where someone could attach a visit/item to another user's `restaurant_id`/
`visit_id` (a guessed uuid) even though their own `user_id` passes.

```sql
-- restaurants
alter table public.restaurants enable row level security;
create policy "own_select" on public.restaurants for select using (user_id = auth.uid());
create policy "own_insert" on public.restaurants for insert with check (user_id = auth.uid());
create policy "own_update" on public.restaurants for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own_delete" on public.restaurants for delete using (user_id = auth.uid());

-- visits (parent ownership enforced)
alter table public.visits enable row level security;
create policy "own_select" on public.visits for select using (user_id = auth.uid());
create policy "own_insert" on public.visits for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.restaurants r where r.id = restaurant_id and r.user_id = auth.uid())
);
create policy "own_update" on public.visits for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own_delete" on public.visits for delete using (user_id = auth.uid());

-- ordered_items (parent ownership enforced)
alter table public.ordered_items enable row level security;
create policy "own_select" on public.ordered_items for select using (user_id = auth.uid());
create policy "own_insert" on public.ordered_items for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.visits v where v.id = visit_id and v.user_id = auth.uid())
);
create policy "own_update" on public.ordered_items for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own_delete" on public.ordered_items for delete using (user_id = auth.uid());
```

## 0003_add_visit_with_items.sql
A `security definer`-free plpgsql function that runs as the caller (RLS still applies) and inserts
atomically:
```sql
create or replace function public.add_visit_with_items(payload jsonb)
returns jsonb language plpgsql as $$
declare
  v_restaurant_id uuid;
  v_visit_id uuid;
  v_osm text := payload->'restaurant'->>'osmId';
begin
  -- dedupe by (user_id, osm_id) when osmId present
  if v_osm is not null then
    select id into v_restaurant_id from public.restaurants
      where user_id = auth.uid() and osm_id = v_osm limit 1;
  end if;
  if v_restaurant_id is null then
    insert into public.restaurants (name, latitude, longitude, address, osm_id, source)
    values (
      payload->'restaurant'->>'name',
      (payload->'restaurant'->>'latitude')::float8,
      (payload->'restaurant'->>'longitude')::float8,
      payload->'restaurant'->>'address',
      v_osm,
      coalesce(payload->'restaurant'->>'source','manual')
    ) returning id into v_restaurant_id;
  end if;

  insert into public.visits (restaurant_id, visited_at, notes)
  values (v_restaurant_id, coalesce((payload->>'visitedAt')::timestamptz, now()), payload->>'notes')
  returning id into v_visit_id;

  insert into public.ordered_items (visit_id, name, price, rating, notes)
  select v_visit_id, x->>'name', (x->>'price')::numeric, (x->>'rating')::int, x->>'notes'
  from jsonb_array_elements(payload->'items') as x;

  return jsonb_build_object('restaurantId', v_restaurant_id, 'visitId', v_visit_id);
end; $$;
```

## Schema fit / design notes
- **Shape matches the use case:** `restaurants 1—* visits 1—* ordered_items`. A user can visit the same
  restaurant many times; the Lookup aggregates items across all visits → answers "past items here".
- **`visited_at` defaults to now() but is settable** via the RPC payload → supports backdating a visit.
- **`user_id` denormalized onto every table** so RLS checks need no joins; defaults to `auth.uid()` so
  the app never sends it. Cross-table ownership is enforced in the child insert policies (above).
- **Cascade deletes:** removing a restaurant removes its visits + items; removing a user (auth.users)
  removes all their data.
- **Indexes track the real queries:** `(user_id, name)` for the restaurant list/search,
  `(restaurant_id, visited_at desc)` for paginated history, `(visit_id)` for nested item fetch.
- **Deliberately out of scope (see [LEDGER.md](../LEDGER.md)):** GPS-proximity dedup for manual entries
  (F5/PostGIS), currency code on `price` (single-currency assumed), per-visit/per-restaurant rating
  (rating lives on items only, per the agreed model).

## Acceptance criteria
- Running the three migrations creates tables, indexes, RLS policies, and the function with no errors.
- With two test users, each can only read their own rows (RLS verified).
- A user **cannot** insert a visit/item referencing another user's restaurant/visit (parent-ownership `with check` blocks it).
- `source` only accepts `'osm'`/`'manual'`; `rating` only `1–5`.
- `supabase.rpc('add_visit_with_items', { payload })` inserts restaurant (deduped by osm_id) + visit + items atomically.
