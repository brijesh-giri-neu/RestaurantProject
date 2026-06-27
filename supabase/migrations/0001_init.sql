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
