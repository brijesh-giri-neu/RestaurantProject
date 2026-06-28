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

/** A single ordered-item match, enriched with its visit and restaurant. */
export type DishHit = {
  item: OrderedItem;
  visit: Visit;
  restaurant: Restaurant;
};

type OrderedItemWithContextRow = OrderedItemRow & {
  visits: VisitRow & { restaurants: RestaurantRow };
};

/**
 * Paginated, case-insensitive search over ordered-item (dish) names. Each hit
 * is enriched with its parent visit and restaurant, ordered by newest visit
 * first. RLS auto-scopes to the current user. Throws on error.
 */
export async function searchDishes(
  term: string,
  opts?: { limit?: number; offset?: number },
): Promise<Page<DishHit>> {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const offset = opts?.offset ?? 0;

  // `!inner` makes the visit (and its restaurant) join required, so ordering by
  // a joined column is well-defined and rows without a visit are excluded.
  const { data, error } = await supabase
    .from('ordered_items')
    .select('*, visits!inner(*, restaurants!inner(*))')
    .ilike('name', `%${term}%`)
    .order('visited_at', { ascending: false, referencedTable: 'visits' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const rows = (data as unknown as OrderedItemWithContextRow[]).map((row) => ({
    item: mapOrderedItem(row),
    visit: mapVisit(row.visits),
    restaurant: mapRestaurant(row.visits.restaurants),
  }));

  return {
    rows,
    nextOffset: rows.length === limit ? offset + limit : null,
  };
}
