// Central, validated access to environment variables loaded from .env (via react-native-dotenv).
// Import `env` from here everywhere — do not read from '@env' directly elsewhere.
import {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  OSM_OVERPASS_URL,
  OSM_NOMINATIM_URL,
  OSM_USER_AGENT,
} from '@env';

function required(name: string, value: string | undefined): string {
  if (!value || value.startsWith('YOUR-')) {
    throw new Error(
      `Missing/placeholder env var "${name}". Set it in your .env file.`,
    );
  }
  return value;
}

export const env = {
  SUPABASE_URL: required('SUPABASE_URL', SUPABASE_URL),
  SUPABASE_PUBLISHABLE_KEY: required('SUPABASE_PUBLISHABLE_KEY', SUPABASE_PUBLISHABLE_KEY),
  OSM_OVERPASS_URL: OSM_OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
  OSM_NOMINATIM_URL: OSM_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  OSM_USER_AGENT: OSM_USER_AGENT || 'RestaurantProject/0.1',
};
