import { supabase } from '../lib/supabase';
import type { RestaurantSource } from './types';

export type AddVisitPayload = {
  restaurant: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    osmId?: string;
    source: RestaurantSource;
  };
  visitedAt?: string;
  notes?: string;
  items: Array<{
    name: string;
    price?: number;
    rating?: number;
    notes?: string;
  }>;
};

/**
 * Persists restaurant (deduped) + visit + items atomically via the
 * `add_visit_with_items` RPC. RLS scopes the write to the current user.
 * Throws on error for the caller to handle.
 */
export async function addVisitWithItems(
  payload: AddVisitPayload,
): Promise<{ restaurantId: string; visitId: string }> {
  const { data, error } = await supabase.rpc('add_visit_with_items', { payload });
  if (error) {
    throw error;
  }
  return data as { restaurantId: string; visitId: string };
}
