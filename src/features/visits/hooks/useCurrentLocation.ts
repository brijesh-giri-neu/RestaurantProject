import { useCallback, useEffect, useState } from 'react';
import { getCurrentLocation, type Coordinates } from '../../../services/location';

type UseCurrentLocationResult = {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not determine your location.';
}

/**
 * Wraps {@link getCurrentLocation}. Fetches a fix on mount and exposes a
 * `refresh` to re-request. Never throws — failures surface via `error`.
 */
export function useCurrentLocation(): UseCurrentLocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCurrentLocation();
      setCoords(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  return { coords, loading, error, refresh };
}
