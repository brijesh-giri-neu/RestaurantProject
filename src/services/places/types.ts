/**
 * A candidate place returned from a places lookup. Coordinates are decimal
 * degrees; `address` and `osmId` are populated when available.
 */
export type PlaceCandidate = {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  osmId?: string;
};

/**
 * Swappable interface for nearby-place autofill. Implementations must never
 * throw from {@link PlacesService.nearbyRestaurants}; they return `[]` on
 * network/parse errors or when nothing is found.
 */
export interface PlacesService {
  nearbyRestaurants(
    lat: number,
    lng: number,
    radiusMeters?: number,
  ): Promise<PlaceCandidate[]>;
}
