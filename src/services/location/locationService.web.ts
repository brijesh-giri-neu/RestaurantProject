import { requestLocationPermission } from './permissions';

export type Coordinates = { latitude: number; longitude: number; accuracy?: number };

/**
 * Web counterpart to {@link LocationError} on native. Carries the optional
 * numeric `code` from the browser's `GeolocationPositionError`.
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
 * Resolves the browser's current coordinates via `navigator.geolocation`,
 * mirroring the native `getCurrentLocation` contract (single high-accuracy fix,
 * always rejects with a {@link LocationError} on failure).
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  const available = await requestLocationPermission();
  if (!available) {
    throw new LocationError('Geolocation is not available in this browser.');
  }

  return new Promise<Coordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude, longitude, accuracy });
      },
      error => {
        reject(new LocationError(error.message, error.code));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
