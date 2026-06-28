create or replace function public.update_visit_with_items(payload jsonb)
returns jsonb language plpgsql as $$
declare
  v_visit_id uuid := (payload->>'visitId')::uuid;
  v_owner uuid;
begin
  -- verify the visit exists and belongs to the caller (RLS also applies)
  select user_id into v_owner from public.visits
    where id = v_visit_id and user_id = auth.uid();
  if v_owner is null then
    raise exception 'Visit % not found or not owned by current user', v_visit_id;
  end if;

  -- update only the editable fields (restaurant linkage is unchanged)
  update public.visits
  set
    visited_at = coalesce((payload->>'visitedAt')::timestamptz, visited_at),
    notes = payload->>'notes'
  where id = v_visit_id;

  -- replace the visit's items
  delete from public.ordered_items where visit_id = v_visit_id;

  insert into public.ordered_items (visit_id, name, price, rating, notes)
  select v_visit_id, x->>'name', (x->>'price')::numeric, (x->>'rating')::int, x->>'notes'
  from jsonb_array_elements(payload->'items') as x;

  return jsonb_build_object('visitId', v_visit_id);
end; $$;
