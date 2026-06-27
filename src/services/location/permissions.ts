import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

/**
 * Requests the OS-level permission required to read the device location.
 *
 * - Android: requests `ACCESS_FINE_LOCATION` at runtime.
 * - iOS: relies on Info.plist usage descriptions and asks the geolocation
 *   library for "when in use" authorization.
 *
 * @returns `true` when the app is allowed to read the current location.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message: 'This app needs access to your location to find nearby restaurants.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const authorization = await Geolocation.requestAuthorization('whenInUse');
  return authorization === 'granted';
}
