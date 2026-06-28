import { useEffect, useRef, useState } from 'react';
import { listRestaurants } from '../../../data/restaurants';
import { searchDishes, type DishHit } from '../../../data/search';
import type { Restaurant } from '../../../data/types';

const DEBOUNCE_MS = 300;
const PAGE_LIMIT = 20;

/**
 * Debounced search across restaurant names and dish (ordered-item) names.
 * Returns the current `term`, a `setTerm` setter, and the first page of
 * matching `restaurants` and `dishes`. An empty term yields empty results.
 */
export function useSearch(): {
  term: string;
  setTerm: (value: string) => void;
  restaurants: Restaurant[];
  dishes: DishHit[];
  loading: boolean;
} {
  const [term, setTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<DishHit[]>([]);
  const [loading, setLoading] = useState(false);

  // Increments on each query so stale responses can be discarded.
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = term.trim();
    if (!trimmed) {
      setRestaurants([]);
      setDishes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    const handle = setTimeout(() => {
      void (async () => {
        try {
          const [restaurantPage, dishPage] = await Promise.all([
            listRestaurants({ search: trimmed, limit: PAGE_LIMIT }),
            searchDishes(trimmed, { limit: PAGE_LIMIT }),
          ]);
          if (requestId !== requestIdRef.current) {
            return;
          }
          setRestaurants(restaurantPage.rows);
          setDishes(dishPage.rows);
        } catch {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setRestaurants([]);
          setDishes([]);
        } finally {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [term]);

  return { term, setTerm, restaurants, dishes, loading };
}
