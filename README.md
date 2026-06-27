# RestaurantProject

A cross-platform mobile app, built with [React Native](https://reactnative.dev) (v0.86.0) and TypeScript, for **tracking the restaurants you visit and the items you order**, storing them in a local database.

## Goal

Collect and persist data about:

- **Visited restaurants** — name, location, date of visit, notes/ratings
- **Ordered items** — dishes ordered at each visit, price, rating

This data is kept in an on-device database so you can build up a personal history of where you've eaten and what you've ordered.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Watchman](https://facebook.github.io/watchman/) (recommended on macOS)
- **iOS:** Xcode, CocoaPods, Ruby/Bundler
- **Android:** Android Studio, JDK 17, an emulator or device

See the official [React Native environment setup](https://reactnative.dev/docs/environment-setup) guide for details.

## Getting Started

Install JavaScript dependencies:

```sh
npm install
```

For iOS, install native pods (first time and after native dependency changes):

```sh
cd ios && bundle install && bundle exec pod install && cd ..
```

## Running the App

Start the Metro bundler:

```sh
npm start
```

Then, in a separate terminal, build and launch the app:

```sh
# iOS
npm run ios

# Android
npm run android
```

## Testing & Linting

```sh
npm test      # run Jest tests
npm run lint  # run ESLint
```

## Data Model (planned)

| Entity      | Fields                                                        |
| ----------- | ------------------------------------------------------------- |
| Restaurant  | id, name, location, visitedAt, rating, notes                 |
| OrderedItem | id, restaurantId (FK), name, price, rating, notes            |

A restaurant has many ordered items (one-to-many).

## Project Structure

```
.
├── android/        # Native Android project
├── ios/            # Native iOS project
├── __tests__/      # Jest test files
├── App.tsx         # Root application component
├── index.js        # App entry point
└── package.json    # Scripts and dependencies
```

## License

Private — all rights reserved.
