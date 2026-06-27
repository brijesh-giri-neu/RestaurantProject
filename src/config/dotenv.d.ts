// Type declarations for variables imported from the .env file via react-native-dotenv.
// NOTE: must not share a basename with env.ts, or TS treats it as env.ts's generated
// declaration and ignores the ambient `declare module '@env'` below.
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_PUBLISHABLE_KEY: string;
  export const OSM_OVERPASS_URL: string;
  export const OSM_NOMINATIM_URL: string;
  export const OSM_USER_AGENT: string;
}
