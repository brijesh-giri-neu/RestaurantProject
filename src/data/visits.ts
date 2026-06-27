import { supabase } from '../lib/supabase';
import {
  mapOrderedItem,
  mapVisit,
  type OrderedItem,
  type OrderedItemRow,
  type Page,
  type Visit,
  type VisitRow,
} from './types';

const DEFAULT_LIMIT = 20;

type VisitWithItemsRow = VisitRow & { ordered_items: OrderedItemRow[] };

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
