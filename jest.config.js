module.exports = {
  preset: '@react-native/jest-preset',
  // Several RN/React Navigation packages ship untranspiled ESM; allow Babel to
  // transform them instead of treating node_modules as opaque.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '@react-native' +
      '|react-native' +
      '|@react-navigation' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|react-native-url-polyfill' +
      '|react-native-geolocation-service' +
      '|@react-native-async-storage' +
      ')/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
