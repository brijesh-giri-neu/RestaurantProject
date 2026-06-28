// Web replacement for the `@env` module that react-native-dotenv injects on
// native. Values come from the same `.env` file via Vite's import.meta.env
// (exposed through `envPrefix` in vite.config.mjs). `src/config/env.ts`
// validates these at startup, so plain pass-through is enough here.
export const SUPABASE_URL = import.meta.env.SUPABASE_URL as string | undefined;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const OSM_OVERPASS_URL = import.meta.env.OSM_OVERPASS_URL as
  | string
  | undefined;
export const OSM_NOMINATIM_URL = import.meta.env.OSM_NOMINATIM_URL as
  | string
  | undefined;
export const OSM_USER_AGENT = import.meta.env.OSM_USER_AGENT as
  | string
  | undefined;
