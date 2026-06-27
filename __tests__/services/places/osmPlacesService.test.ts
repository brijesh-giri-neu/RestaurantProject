// Mock the validated env module so importing the service does not require a
// real .env (env.ts throws on missing/placeholder Supabase vars).
jest.mock('../../../src/config/env', () => ({
  env: {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'test-key',
    OSM_OVERPASS_URL: 'https://overpass.test/api/interpreter',
    OSM_NOMINATIM_URL: 'https://nominatim.test',
    OSM_USER_AGENT: 'RestaurantProject-Test/0.1',
  },
}));

import { osmPlacesService } from '../../../src/services/places/osmPlacesService';

type FetchMock = jest.Mock<Promise<unknown>, [string, unknown?]>;

function jsonResponse(ok: boolean, body: unknown): unknown {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  };
}

const ORIGIN_LAT = 40.0;
const ORIGIN_LNG = -73.0;

describe('osmPlacesService.nearbyRestaurants', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    (globalThis as { fetch: unknown }).fetch = fetchMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('parses an Overpass response into PlaceCandidates sorted closest-first', async () => {
    // Two named restaurants: one far, one near the origin. Plus a reverse
    // geocode call to enrich the closest candidate's address.
    const overpassBody = {
      elements: [
        {
          type: 'node',
          id: 100,
          lat: 41.0, // ~111 km away (far)
          lon: -73.0,
          tags: { name: 'Far Diner', amenity: 'restaurant' },
        },
        {
          type: 'node',
          id: 200,
          lat: 40.001, // very close
          lon: -73.001,
          tags: { name: 'Near Bistro', amenity: 'restaurant' },
        },
      ],
    };

    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, overpassBody)) // Overpass
      .mockResolvedValueOnce(
        jsonResponse(true, { display_name: '1 Near St, Townsville' }), // Nominatim
      );

    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Near Bistro');
    expect(results[1].name).toBe('Far Diner');
    expect(results[0].osmId).toBe('node/200');
    expect(results[1].osmId).toBe('node/100');
    // Closest candidate enriched with reverse-geocoded address.
    expect(results[0].address).toBe('1 Near St, Townsville');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('skips elements without a name or with non-finite coordinates', async () => {
    const overpassBody = {
      elements: [
        { type: 'node', id: 1, lat: 40.0, lon: -73.0, tags: {} }, // no name
        {
          type: 'node',
          id: 2,
          lat: undefined,
          lon: -73.0,
          tags: { name: 'No Lat' },
        },
        {
          type: 'node',
          id: 3,
          lat: 40.002,
          lon: -73.002,
          tags: { name: 'Valid Cafe' },
        },
      ],
    };

    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, overpassBody))
      .mockResolvedValueOnce(jsonResponse(true, {})); // reverse geocode, no address

    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Valid Cafe');
    expect(results[0].address).toBeUndefined();
  });

  it('returns [] for a non-200 Overpass response', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(false, {}));
    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );
    expect(results).toEqual([]);
  });

  it('returns [] when Overpass yields no usable elements', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(true, { elements: [] }));
    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );
    expect(results).toEqual([]);
    // No reverse-geocode call when there are no candidates.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns [] when fetch throws (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );
    expect(results).toEqual([]);
  });

  it('still returns candidates when reverse-geocode fails', async () => {
    const overpassBody = {
      elements: [
        {
          type: 'node',
          id: 9,
          lat: 40.001,
          lon: -73.001,
          tags: { name: 'Solo Spot' },
        },
      ],
    };
    fetchMock
      .mockResolvedValueOnce(jsonResponse(true, overpassBody))
      .mockRejectedValueOnce(new Error('nominatim down'));

    const results = await osmPlacesService.nearbyRestaurants(
      ORIGIN_LAT,
      ORIGIN_LNG,
    );
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Solo Spot');
    expect(results[0].address).toBeUndefined();
  });
});
