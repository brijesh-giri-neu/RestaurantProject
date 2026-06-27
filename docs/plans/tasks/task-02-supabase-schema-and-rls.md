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
  source text not null default 'manual',
  created_at timestamptz not null default now()
);
create unique index restaurants_user_osm_uniq on public.restaurants(user_id, osm_id) where osm_id is not null;

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  visited_at timestamptz not null default now(),
  notes text
);
create index visits_restaurant_idx on public.visits(restaurant_id);

create table public.ordered_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  name text not null,
  price numeric,
  rating int check (rating between 1 and 5),
  notes text
);
create index ordered_items_visit_idx on public.ordered_items(visit_id);
```

## 0002_rls.sql
Enable RLS on all three tables and add policies so a user can only `select/insert/update/delete`
rows where `user_id = auth.uid()`. Example per table:
```sql
alter table public.restaurants enable row level security;
create policy "own_select" on public.restaurants for select using (user_id = auth.uid());
create policy "own_insert" on public.restaurants for insert with check (user_id = auth.uid());
create policy "own_update" on public.restaurants for update using (user_id = auth.uid());
create policy "own_delete" on public.restaurants for delete using (user_id = auth.uid());
```
Repeat for `visits` and `ordered_items`.

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

## Acceptance criteria
- Running the three migrations creates tables, indexes, RLS policies, and the function with no errors.
- With two test users, each can only read their own rows (RLS verified).
- `supabase.rpc('add_visit_with_items', { payload })` inserts restaurant (deduped) + visit + items atomically.
