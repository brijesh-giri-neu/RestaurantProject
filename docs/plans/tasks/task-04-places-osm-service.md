# Task 04 — OSM Places Autofill Service

**Owner:** subagent-places · **Depends on:** task-01 · **Parallel with:** task-03, task-05, task-06

## Objective
Given GPS coordinates, return nearby restaurant candidates (name + osmId + address) using
**free OpenStreetMap** APIs, behind a swappable `PlacesService` interface.

## Files to create
- `src/services/places/types.ts`
  ```ts
  export type PlaceCandidate = { name: string; latitude: number; longitude: number; address?: string; osmId?: string };
  export interface PlacesService { nearbyRestaurants(lat: number, lng: number, radiusMeters?: number): Promise<PlaceCandidate[]>; }
  ```
- `src/services/places/osmPlacesService.ts` — implements `PlacesService`:
  - **Overpass API** (`OSM_OVERPASS_URL` from config): query
    `node["amenity"="restaurant"](around:RADIUS,lat,lng);` (default radius 100 m), parse `tags.name`,
    build `osmId = "node/<id>"`, sort by haversine distance (use `src/shared/utils/geo.ts`).
  - Optional: **Nominatim** reverse geocode (`OSM_NOMINATIM_URL`) to fill `address` for top candidate.
  - Send the `User-Agent` header from `OSM_USER_AGENT` (OSM policy). Handle non-200/empty → return `[]`.
- `src/services/places/index.ts` — `export const placesService: PlacesService = osmPlacesService;`

## Acceptance criteria
- `placesService.nearbyRestaurants(lat,lng)` returns a sorted candidate list (closest first); returns `[]` (never throws) on network/empty.
- Required `User-Agent` sent.
- Implementation hidden behind `PlacesService`; screens import only `placesService`.
