import { haversineDistanceMeters } from '../../src/shared/utils/geo';

describe('haversineDistanceMeters', () => {
  it('returns zero for identical points', () => {
    expect(haversineDistanceMeters(40.0, -73.0, 40.0, -73.0)).toBe(0);
  });

  it('approximates a known distance (London -> Paris ~343 km)', () => {
    // London (51.5074, -0.1278) -> Paris (48.8566, 2.3522)
    const meters = haversineDistanceMeters(51.5074, -0.1278, 48.8566, 2.3522);
    const km = meters / 1000;
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(360);
  });

  it('approximates one degree of latitude (~111 km)', () => {
    const meters = haversineDistanceMeters(0, 0, 1, 0);
    expect(meters).toBeGreaterThan(110_000);
    expect(meters).toBeLessThan(112_000);
  });

  it('is symmetric (a->b equals b->a)', () => {
    const ab = haversineDistanceMeters(10, 20, 30, 40);
    const ba = haversineDistanceMeters(30, 40, 10, 20);
    expect(ab).toBeCloseTo(ba, 6);
  });

  it('orders nearer points before farther ones', () => {
    const origin = { lat: 0, lng: 0 };
    const near = haversineDistanceMeters(origin.lat, origin.lng, 0.001, 0.001);
    const far = haversineDistanceMeters(origin.lat, origin.lng, 0.01, 0.01);
    expect(near).toBeLessThan(far);
  });
});
