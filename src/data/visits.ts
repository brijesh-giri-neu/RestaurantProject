import { supabase } from '../lib/supabase';
import {
  mapOrderedItem,
  mapRestaurant,
  mapVisit,
  type OrderedItem,
  type OrderedItemRow,
  type Page,
  type Restaurant,
  type RestaurantRow,
  type Visit,
  type VisitRow,
} from './types';

const DEFAULT_LIMIT = 20;

type VisitWithItemsRow = VisitRow & { ordered_items: OrderedItemRow[] };

type VisitWithContextRow = VisitRow & {
  restaurants: RestaurantRow;
  ordered_items: OrderedItemRow[];
};

/**
 * A visit enriched with its restaurant and ordered items, as returned by
 * `listVisits`.
 */
export type VisitWithContext = {
  visit: Visit;
  restaurant: Restaurant;
  items: OrderedItem[];
};

/**
 * Paginated history of visits for a restaurant, newest first
 * (`visited_at desc`), with nested ordered items. RLS-scoped to the
 * current user. Throws on error.
 */
export async function historyForRestaurant(
  restaurantId: string,
  opts?: { limit?: number; offset?: number },
): Promise<Page<{ visit: Visit; items: OrderedItem[] }>> {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const offset = opts?.offset ?? 0;

  const { data, error } = await supabase
    .from('visits')
    .select('*, ordered_items(*)')
    .eq('restaurant_id', restaurantId)
    .order('visited_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const rows = (data as VisitWithItemsRow[]).map((row) => ({
    visit: mapVisit(row),
    items: (row.ordered_items ?? []).map(mapOrderedItem),
  }));

  return {
    rows,
    nextOffset: rows.length === limit ? offset + limit : null,
  };
}

/**
 * Loads a single visit (RLS-scoped to the current user) enriched with its
 * restaurant and ordered items, for editing. Throws on error or if no visit
 * with the given id is visible to the current user.
 */
export async function getVisit(visitId: string): Promise<VisitWithContext> {
  const { data, error } = await supabase
    .from('visits')
    .select('*, restaurants(*), ordered_items(*)')
    .eq('id', visitId)
    .single();

  if (error) {
    throw error;
  }

  const row = data as unknown as VisitWithContextRow;
  return {
    visit: mapVisit(row),
    restaurant: mapRestaurant(row.restaurants),
    items: (row.ordered_items ?? []).map(mapOrderedItem),
  };
}

/**
 * Paginated list of ALL of the current user's visits across every restaurant,
 * newest first (`visited_at desc`), each enriched with its restaurant and
 * ordered items. RLS-scoped to the current user. Optional case-insensitive
 * `search` filters by restaurant name. Throws on error.
 */
export async function listVisits(opts?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Page<VisitWithContext>> {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const offset = opts?.offset ?? 0;

  // `!inner` makes the restaurant join filterable (and required), so a
  // `restaurants.name` filter restricts the parent visit rows.
  const select = opts?.search
    ? '*, restaurants!inner(*), ordered_items(*)'
    : '*, restaurants(*), ordered_items(*)';

  let query = supabase
    .from('visits')
    .select(select)
    .order('visited_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts?.search) {
    query = query.ilike('restaurants.name', `%${opts.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = (data as unknown as VisitWithContextRow[]).map((row) => ({
    visit: mapVisit(row),
    restaurant: mapRestaurant(row.restaurants),
    items: (row.ordered_items ?? []).map(mapOrderedItem),
  }));

  return {
    rows,
    nextOffset: rows.length === limit ? offset + limit : null,
  };
}
