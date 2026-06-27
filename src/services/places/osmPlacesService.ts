// OpenStreetMap-backed implementation of PlacesService.
//
// - Overpass API for nearby `amenity=restaurant` nodes.
// - Optional Nominatim reverse-geocode to enrich the closest candidate with an
//   address.
// Both calls send the OSM-required `User-Agent` header and never throw: any
// failure (network, non-200, malformed body, empty result) resolves to `[]`
// (or leaves `address` unset for the Nominatim enrichment).

import { env } from '../../config/env';
import { haversineDistanceMeters } from '../../shared/utils/geo';

import type { PlaceCandidate, PlacesService } from './types';

const DEFAULT_RADIUS_METERS = 100;
const OVERPASS_TIMEOUT_SECONDS = 25;

/** Minimal shape of an Overpass `node` element we care about. */
type OverpassElement = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

/** Minimal shape of a Nominatim reverse-geocode response. */
type NominatimReverseResponse = {
  display_name?: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function buildOverpassQuery(
  lat: number,
  lng: number,
  radiusMeters: number,
): string {
  return (
    `[out:json][timeout:${OVERPASS_TIMEOUT_SECONDS}];` +
    `node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});` +
    'out body;'
  );
}

function parseOverpass(
  body: OverpassResponse,
  originLat: number,
  originLng: number,
): PlaceCandidate[] {
  const elements = Array.isArray(body.elements) ? body.elements : [];

  const candidates: PlaceCandidate[] = [];
  for (const el of elements) {
    const name = el.tags?.name;
    if (
      typeof name !== 'string' ||
      name.length === 0 ||
      !isFiniteNumber(el.lat) ||
      !isFiniteNumber(el.lon)
    ) {
      continue;
    }

    const candidate: PlaceCandidate = {
      name,
      latitude: el.lat,
      longitude: el.lon,
    };
    if (isFiniteNumber(el.id)) {
      candidate.osmId = `node/${el.id}`;
    }
    candidates.push(candidate);
  }

  candidates.sort(
    (a, b) =>
      haversineDistanceMeters(originLat, originLng, a.latitude, a.longitude) -
      haversineDistanceMeters(originLat, originLng, b.latitude, b.longitude),
  );

  return candidates;
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | undefined> {
  const base = env.OSM_NOMINATIM_URL.replace(/\/+$/, '');
  const url =
    `${base}/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}` +
    `&lon=${encodeURIComponent(String(lng))}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': env.OSM_USER_AGENT,
      },
    });
    if (!response.ok) {
      return undefined;
    }
    const body = (await response.json()) as NominatimReverseResponse;
    const displayName = body.display_name;
    return typeof displayName === 'string' && displayName.length > 0
      ? displayName
      : undefined;
  } catch {
    return undefined;
  }
}

export const osmPlacesService: PlacesService = {
  async nearbyRestaurants(
    lat: number,
    lng: number,
    radiusMeters: number = DEFAULT_RADIUS_METERS,
  ): Promise<PlaceCandidate[]> {
    try {
      const query = buildOverpassQuery(lat, lng, radiusMeters);
      const response = await fetch(env.OSM_OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': env.OSM_USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        return [];
      }

      const body = (await response.json()) as OverpassResponse;
      const candidates = parseOverpass(body, lat, lng);
      if (candidates.length === 0) {
        return [];
      }

      // Enrich the closest candidate with a human-readable address. Failure
      // here must not discard the candidate list.
      const closest = candidates[0];
      if (!closest.address) {
        const address = await reverseGeocode(
          closest.latitude,
          closest.longitude,
        );
        if (address) {
          closest.address = address;
        }
      }

      return candidates;
    } catch {
      return [];
    }
  },
};
