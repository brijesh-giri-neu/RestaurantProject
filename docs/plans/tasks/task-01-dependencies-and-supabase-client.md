# Task 01 — Dependencies, Config & Supabase Client

**Owner:** subagent-infra · **Depends on:** none (do first)

## Objective
Install all libraries for the first core requirement and create the Supabase client + config.

## Steps
1. Install runtime deps (stay inside the project):
   ```sh
   npm install @supabase/supabase-js @react-native-async-storage/async-storage \
     react-native-url-polyfill react-native-geolocation-service \
     @react-navigation/native @react-navigation/native-stack \
     react-native-screens react-native-safe-area-context \
     react-hook-form zod
   ```
2. iOS pods: `cd ios && bundle exec pod install && cd ..`
3. **Location permissions:**
   - iOS `ios/RestaurantProject/Info.plist`: `NSLocationWhenInUseUsageDescription` = "We use your location to find and log the restaurant you're visiting."
   - Android `android/app/src/main/AndroidManifest.xml`: add `ACCESS_FINE_LOCATION`; verify `INTERNET`.
4. **Env config (already scaffolded — see below):** values live in a git-ignored `.env`, loaded via
   `react-native-dotenv` (Babel plugin) and exposed through a validated `src/config/env.ts`.
   - `.env` (git-ignored) holds `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, OSM vars.
   - `babel.config.js` has the `module:react-native-dotenv` plugin (`moduleName: '@env'`).
   - `src/config/env.d.ts` declares the `@env` module; `src/config/env.ts` validates + exports `env`.
   - The developer fills real values into `.env`. Use the Supabase **publishable** key
     (`sb_publishable_...`, client-safe); never the **secret** key (`sb_secret_...`).
5. **Supabase client** `src/lib/supabase.ts`:
   ```ts
   import 'react-native-url-polyfill/auto';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { createClient } from '@supabase/supabase-js';
   import { env } from '../config/env';
   export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
     auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
   });
   ```

## Acceptance criteria
- `npm install` + `pod install` succeed; app still builds/launches.
- Permission strings present (iOS Info.plist, Android manifest).
- `src/lib/supabase.ts` exports a configured client reading from `env`; `.env` git-ignored.

## Already done (this step is partially scaffolded)
`.env`, `src/config/env.ts`, `src/config/env.d.ts`, the babel plugin (`react-native-dotenv` installed),
and `.gitignore` entries are already in place. Remaining for this task: install the npm deps (step 1),
pods (step 2), permissions (step 3), and create `src/lib/supabase.ts` (step 5).

## Notes
- Use the Supabase **publishable** key (`sb_publishable_...`, client-safe). Never add the **secret** key (`sb_secret_...`).
