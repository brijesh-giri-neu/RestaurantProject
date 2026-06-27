import Geolocation, { GeoError, GeoPosition } from 'react-native-geolocation-service';

import { requestLocationPermission } from './permissions';

export type Coordinates = { latitude: number; longitude: number; accuracy?: number };

/**
 * Error thrown when the current location cannot be resolved (permission
 * denied, timeout, position unavailable, etc.). Carries an optional numeric
 * code mirroring `react-native-geolocation-service`'s `PositionError`.
 */
export class LocationError extends Error {
  readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
  }
}

/**
 * Resolves the device's current GPS coordinates.
 *
 * Requests location permission first, then reads a single high-accuracy fix.
 * Rejects with a {@link LocationError} on permission denial, timeout, or any
 * other geolocation failure — never leaves an unhandled rejection.
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new LocationError('Location permission was denied.');
  }

  return new Promise<Coordinates>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude, longitude, accuracy });
      },
      (error: GeoError) => {
        reject(new LocationError(error.message, error.code));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
