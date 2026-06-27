# Task 03 — Location / GPS Service

**Owner:** subagent-location · **Depends on:** task-01 · **Parallel with:** task-04, task-05, task-06

## Objective
Provide a clean API to request permission and fetch the device's current GPS coordinates.

## Files to create
- `src/services/location/permissions.ts` — `requestLocationPermission(): Promise<boolean>`
  - Android: `PermissionsAndroid.request(ACCESS_FINE_LOCATION)`.
  - iOS: rely on Info.plist + the geolocation lib's authorization request.
- `src/services/location/locationService.ts` — `getCurrentLocation(): Promise<Coordinates>`
  - Uses `react-native-geolocation-service` `getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }`.
  - Rejects with a typed error on permission denial / timeout.
- `src/services/location/index.ts` — barrel.

## Types
```ts
export type Coordinates = { latitude: number; longitude: number; accuracy?: number };
```

## Acceptance criteria
- `getCurrentLocation()` resolves to coordinates on a device/emulator with location set.
- Permission denial path returns a clear, catchable error (no unhandled rejection).
- No UI here; consumed by `useCurrentLocation` hook (task-08).
