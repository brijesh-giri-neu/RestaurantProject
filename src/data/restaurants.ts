import { supabase } from '../lib/supabase';
import { mapRestaurant, type Page, type Restaurant, type RestaurantRow } from './types';

const DEFAULT_LIMIT = 20;

/**
 * Paginated, name-ordered list of the current user's restaurants (RLS-scoped).
 * Optional case-insensitive `search` on name. Throws on error.
 */
export async function listRestaurants(opts?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Page<Restaurant>> {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from('restaurants')
    .select('*')
    .order('name')
    .range(offset, offset + limit - 1);

  if (opts?.search) {
    query = query.ilike('name', `%${opts.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = (data as RestaurantRow[]).map(mapRestaurant);
  return {
    rows,
    nextOffset: rows.length === limit ? offset + limit : null,
  };
}
