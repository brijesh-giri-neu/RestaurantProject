import { useCallback, useRef, useState } from 'react';
import { listVisits, type VisitWithContext } from '../../../data';

const PAGE_LIMIT = 20;

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

/**
 * Hook exposing a paginated, accumulating list of all the current user's
 * visits (newest first) for the Browse screen. All data access goes through
 * the `data` barrel (no direct Supabase).
 */
export function useVisitsBrowse() {
  const [state, setState] = useState<PaginatedState<VisitWithContext>>(
    initialState<VisitWithContext>,
  );
  // Offset to use for the *next* page (null nextOffset => no more).
  const offsetRef = useRef<number>(0);

  const fetchPage = useCallback(
    (offset: number) => listVisits({ limit: PAGE_LIMIT, offset }),
    [],
  );

  const refresh = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      refreshing: prev.rows.length > 0,
      loading: prev.rows.length === 0,
      error: null,
    }));
    try {
      const page = await fetchPage(0);
      offsetRef.current = page.nextOffset ?? 0;
      setState({
        rows: page.rows,
        loading: false,
        loadingMore: false,
        refreshing: false,
        hasMore: page.nextOffset !== null,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchPage]);

  const loadMore = useCallback(async (): Promise<void> => {
    let shouldFetch = false;
    setState((prev) => {
      if (prev.loading || prev.loadingMore || prev.refreshing || !prev.hasMore) {
        return prev;
      }
      shouldFetch = true;
      return { ...prev, loadingMore: true };
    });
    if (!shouldFetch) {
      return;
    }
    const offset = offsetRef.current;
    try {
      const page = await fetchPage(offset);
      offsetRef.current = page.nextOffset ?? offset;
      setState((prev) => ({
        ...prev,
        rows: [...prev.rows, ...page.rows],
        loadingMore: false,
        hasMore: page.nextOffset !== null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loadingMore: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [fetchPage]);

  return {
    rows: state.rows,
    loading: state.loading,
    loadingMore: state.loadingMore,
    refreshing: state.refreshing,
    hasMore: state.hasMore,
    error: state.error,
    loadMore,
    refresh,
  };
}
