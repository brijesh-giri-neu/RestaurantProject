/**
 * Web counterpart to `permissions.ts`. The browser shows its own location
 * permission prompt on the first `getCurrentPosition` call, so there is no
 * separate runtime request to make here — we only report availability.
 *
 * @returns `true` when the Geolocation API exists in this browser.
 */
export async function requestLocationPermission(): Promise<boolean> {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}
