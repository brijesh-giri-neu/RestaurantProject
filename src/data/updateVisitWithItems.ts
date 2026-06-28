import { supabase } from '../lib/supabase';

export type UpdateVisitPayload = {
  visitId: string;
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
 * Updates a visit's date/notes and replaces its ordered items atomically via
 * the `update_visit_with_items` RPC. The RPC verifies the visit belongs to the
 * current user (RLS also applies). Throws on error for the caller to handle.
 */
export async function updateVisitWithItems(
  visitId: string,
  payload: Omit<UpdateVisitPayload, 'visitId'>,
): Promise<{ visitId: string }> {
  const rpcPayload: UpdateVisitPayload = { ...payload, visitId };
  const { data, error } = await supabase.rpc('update_visit_with_items', {
    payload: rpcPayload,
  });
  if (error) {
    throw error;
  }
  return data as { visitId: string };
}
