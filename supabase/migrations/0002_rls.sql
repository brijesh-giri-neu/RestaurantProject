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
