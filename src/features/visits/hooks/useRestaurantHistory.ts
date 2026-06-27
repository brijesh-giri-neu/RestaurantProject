import { useCallback, useRef, useState } from 'react';
import {
  historyForRestaurant,
  listRestaurants,
  type OrderedItem,
  type Restaurant,
  type Visit,
} from '../../../data';

export type VisitHistoryRow = { visit: Visit; items: OrderedItem[] };

const PAGE_LIMIT = 20;

/**
 * Generic paginated accumulator state for one list (restaurants or history).
 */
type PaginatedState<T> = {
  rows: T[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: Error | null;
};

function initialState<T>(): PaginatedState<T> {
  return {
    rows: [],
    loading: false,
    loadingMore: false,
    refreshing: false,
    hasMore: true,
    error: null,
  };
}

type FetchPage<T> = (offset: number) => Promise<{ rows: T[]; nextOffset: number | null }>;

/**
 * Hook exposing:
 *  - a paginated, searchable restaurant list (`restaurants`, `loadMoreRestaurants`,
 *    `refreshRestaurants`, `setSearch`)
 *  - per-restaurant paginated visit history via `selectRestaurant`/`history`
 *
 * All data access goes through the `data` barrel (no direct Supabase).
 */
export function useRestaurantHistory() {
  // --- Restaurant list state ---
  const [search, setSearchState] = useState('');
  const [restaurantState, setRestaurantState] = useState<PaginatedState<Restaurant>>(
    initialState<Restaurant>,
  );
  // nextOffset to use for the *next* restaurant page (null => no more)
  const restaurantOffsetRef = useRef<number>(0);
  const searchRef = useRef<string>('');

  // --- Selected restaurant + its history state ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyState, setHistoryState] = useState<PaginatedState<VisitHistoryRow>>(
    initialState<VisitHistoryRow>,
  );
  const historyOffsetRef = useRef<number>(0);
  const selectedIdRef = useRef<string | null>(null);

  // ---- Restaurant list ----

  const fetchRestaurantPage = useCallback<FetchPage<Restaurant>>(
    (offset) =>
      listRestaurants({
        limit: PAGE_LIMIT,
        offset,
        ...(searchRef.current ? { search: searchRef.current } : {}),
      }),
    [],
  );

  const refreshRestaurants = useCallback(async (): Promise<void> => {
    setRestaurantState((prev) => ({
      ...prev,
      refreshing: prev.rows.length > 0,
      loading: prev.rows.length === 0,
      error: null,
    }));
    try {
      const page = await fetchRestaurantPage(0);
      restaurantOffsetRef.current = page.nextOffset ?? 0;
      setRestaurantState({
        rows: page.rows,
        loading: false,
        loadingMore: false,
        refreshing: false,
        hasMore: page.nextOffset !== null,
        error: null,
      });
    } catch (err) {
      setRestaurantState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchRestaurantPage]);

  const loadMoreRestaurants = useCallback(async (): Promise<void> => {
    let shouldFetch = false;
    setRestaurantState((prev) => {
      if (prev.loading || prev.loadingMore || prev.refreshing || !prev.hasMore) {
        return prev;
      }
      shouldFetch = true;
      return { ...prev, loadingMore: true };
    });
    if (!shouldFetch) {
      return;
    }
    const offset = restaurantOffsetRef.current;
    try {
      const page = await fetchRestaurantPage(offset);
      restaurantOffsetRef.current = page.nextOffset ?? offset;
      setRestaurantState((prev) => ({
        ...prev,
        rows: [...prev.rows, ...page.rows],
        loadingMore: false,
        hasMore: page.nextOffset !== null,
      }));
    } catch (err) {
      setRestaurantState((prev) => ({
        ...prev,
        loadingMore: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchRestaurantPage]);

  const setSearch = useCallback(
    (value: string): void => {
      searchRef.current = value;
      setSearchState(value);
      void refreshRestaurants();
    },
    [refreshRestaurants],
  );

  // ---- Selected restaurant history ----

  const fetchHistoryPage = useCallback<FetchPage<VisitHistoryRow>>((offset) => {
    const id = selectedIdRef.current;
    if (!id) {
      return Promise.resolve({ rows: [], nextOffset: null });
    }
    return historyForRestaurant(id, { limit: PAGE_LIMIT, offset });
  }, []);

  const refreshHistory = useCallback(async (): Promise<void> => {
    if (!selectedIdRef.current) {
      return;
    }
    setHistoryState((prev) => ({
      ...prev,
      refreshing: prev.rows.length > 0,
      loading: prev.rows.length === 0,
      error: null,
    }));
    try {
      const page = await fetchHistoryPage(0);
      historyOffsetRef.current = page.nextOffset ?? 0;
      setHistoryState({
        rows: page.rows,
        loading: false,
        loadingMore: false,
        refreshing: false,
        hasMore: page.nextOffset !== null,
        error: null,
      });
    } catch (err) {
      setHistoryState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchHistoryPage]);

  const loadMoreHistory = useCallback(async (): Promise<void> => {
    if (!selectedIdRef.current) {
      return;
    }
    let shouldFetch = false;
    setHistoryState((prev) => {
      if (prev.loading || prev.loadingMore || prev.refreshing || !prev.hasMore) {
        return prev;
      }
      shouldFetch = true;
      return { ...prev, loadingMore: true };
    });
    if (!shouldFetch) {
      return;
    }
    const offset = historyOffsetRef.current;
    try {
      const page = await fetchHistoryPage(offset);
      historyOffsetRef.current = page.nextOffset ?? offset;
      setHistoryState((prev) => ({
        ...prev,
        rows: [...prev.rows, ...page.rows],
        loadingMore: false,
        hasMore: page.nextOffset !== null,
      }));
    } catch (err) {
      setHistoryState((prev) => ({
        ...prev,
        loadingMore: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchHistoryPage]);

  const selectRestaurant = useCallback(
    (restaurantId: string): void => {
      selectedIdRef.current = restaurantId;
      historyOffsetRef.current = 0;
      setSelectedId(restaurantId);
      setHistoryState(initialState<VisitHistoryRow>());
      void refreshHistory();
    },
    [refreshHistory],
  );

  const clearSelection = useCallback((): void => {
    selectedIdRef.current = null;
    historyOffsetRef.current = 0;
    setSelectedId(null);
    setHistoryState(initialState<VisitHistoryRow>());
  }, []);

  return {
    // search
    search,
    setSearch,

    // restaurant list
    restaurants: restaurantState.rows,
    restaurantsLoading: restaurantState.loading,
    restaurantsLoadingMore: restaurantState.loadingMore,
    restaurantsRefreshing: restaurantState.refreshing,
    restaurantsHasMore: restaurantState.hasMore,
    restaurantsError: restaurantState.error,
    loadMoreRestaurants,
    refreshRestaurants,

    // selection + history
    selectedId,
    selectRestaurant,
    clearSelection,
    history: historyState.rows,
    historyLoading: historyState.loading,
    historyLoadingMore: historyState.loadingMore,
    historyRefreshing: historyState.refreshing,
    historyHasMore: historyState.hasMore,
    historyError: historyState.error,
    loadMoreHistory,
    refreshHistory,
  };
}
