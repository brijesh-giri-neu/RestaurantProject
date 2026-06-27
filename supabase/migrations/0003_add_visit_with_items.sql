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
