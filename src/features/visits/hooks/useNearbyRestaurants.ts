import { useEffect, useState } from 'react';
import { placesService, type PlaceCandidate } from '../../../services/places';
import type { Coordinates } from '../../../services/location';

type UseNearbyRestaurantsResult = {
  candidates: PlaceCandidate[];
  loading: boolean;
};

/**
 * Fetches nearby restaurant candidates for the given coordinates via
 * {@link placesService}. Re-fetches whenever the coordinates change. The
 * service never throws; an empty list is returned on error or no coords.
 */
export function useNearbyRestaurants(
  coords: Coordinates | null,
): UseNearbyRestaurantsResult {
  const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!coords) {
      setCandidates([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const results = await placesService.nearbyRestaurants(
        coords.latitude,
        coords.longitude,
      );
      if (!cancelled) {
        setCandidates(results);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coords]);

  return { candidates, loading };
}
