# Architecture & Folder Structure

This document defines the modular structure all tasks/subagents must follow.
Backend: **Supabase** (Postgres + Auth + RLS). Scope: **mobile only** for now.

## Principles

1. **Feature-first organization.** UI under `src/features/<feature>`; cross-cutting code under `src/shared`, `src/services`, `src/data`, `src/config`.
2. **Dependency boundaries.** Screens never import the Supabase client, `fetch` for OSM, or geolocation directly. They use **services**, **data-access modules**, and **hooks** exposed via barrel `index.ts` files.
3. **Swappable providers.** External integrations (Supabase, GPS, places) sit behind small TypeScript interfaces so an implementation can change without touching features.
4. **Security in the DB.** Per-user isolation is enforced by **Row Level Security**, not client code. The app uses only the publishable key, never the secret key.
5. **Pure logic is testable.** Validation (zod), dedupe, geo, and response parsing are plain functions, unit-tested in `__tests__`.
6. **No secrets in code.** Supabase URL + publishable key live in a **git-ignored `.env`** (loaded via `react-native-dotenv`, accessed through `src/config/env.ts`); never hardcode. The secret key is never used in the app.

## Target folder structure

```
src/
  app/
    App.tsx                  # root: providers (SafeArea, Auth) + navigation
    navigation/
      RootNavigator.tsx      # auth-gated: AuthStack vs AppStack
      AuthStack.tsx          # Login, Signup
      AppStack.tsx           # AddVisit, Lookup
      types.ts               # route param types
  config/
    env.ts                   # validated access to .env vars (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, OSM...)
    env.d.ts                 # type decls for the '@env' module (react-native-dotenv)
  lib/
    supabase.ts              # createClient singleton (AsyncStorage session, url-polyfill)
  data/                      # cloud data-access (replaces local repositories)
    types.ts                 # Restaurant, Visit, OrderedItem domain types
    restaurants.ts           # list(), upsert helper (or via RPC)
    visits.ts                # historyForRestaurant()
    addVisitWithItems.ts     # supabase.rpc('add_visit_with_items', payload)
    index.ts                 # barrel
  services/
    location/
      permissions.ts
      locationService.ts     # getCurrentLocation() -> Coordinates
      index.ts
    places/
      types.ts               # PlacesService interface, PlaceCandidate
      osmPlacesService.ts    # Overpass nearby + Nominatim reverse-geocode
      index.ts
  features/
    auth/
      context/AuthProvider.tsx   # session state, signIn/signUp/signOut
      screens/LoginScreen.tsx
      screens/SignupScreen.tsx
      validation/authSchema.ts
      index.ts
    visits/
      screens/AddVisitScreen.tsx
      screens/LookupScreen.tsx
      components/OrderedItemRow.tsx
      components/RestaurantSuggestionList.tsx
      hooks/useCurrentLocation.ts
      hooks/useNearbyRestaurants.ts
      hooks/useAddVisit.ts
      hooks/useRestaurantHistory.ts
      validation/visitSchema.ts
      index.ts
  shared/
    components/              # Button, TextField, ScreenContainer
    types/
    utils/                  # geo (haversine), formatting
    theme/
supabase/
  migrations/
    0001_init.sql           # tables + indexes
    0002_rls.sql            # enable RLS + per-user policies
    0003_add_visit_with_items.sql  # transactional RPC function
__tests__/                  # Jest tests mirroring src
```

`index.js` (RN entry) registers `src/app/App.tsx`. The old root `App.tsx` is removed in task-07.

## Module contracts (interfaces other tasks rely on)

```ts
// src/data/types.ts
export type Restaurant = { id: string; name: string; latitude: number; longitude: number; address?: string; osmId?: string; source: 'osm' | 'manual'; createdAt: string };
export type Visit = { id: string; restaurantId: string; visitedAt: string; notes?: string };
export type OrderedItem = { id: string; visitId: string; name: string; price?: number; rating?: number; notes?: string };

// src/lib/supabase.ts
export const supabase: SupabaseClient;   // configured singleton

// src/features/auth context
type AuthState = { session: Session | null; user: User | null; loading: boolean };
signUp(email, password): Promise<void>
signIn(email, password): Promise<void>
signOut(): Promise<void>
useAuth(): AuthState & { signUp; signIn; signOut }

// src/services/location
export type Coordinates = { latitude: number; longitude: number; accuracy?: number };
export function getCurrentLocation(): Promise<Coordinates>;

// src/services/places/types.ts
export type PlaceCandidate = { name: string; latitude: number; longitude: number; address?: string; osmId?: string };
export interface PlacesService { nearbyRestaurants(lat: number, lng: number, radiusMeters?: number): Promise<PlaceCandidate[]>; }

// src/data (Supabase-backed; RLS scopes to current user automatically)
listRestaurants(): Promise<Restaurant[]>
historyForRestaurant(restaurantId: string): Promise<Array<{ visit: Visit; items: OrderedItem[] }>>
addVisitWithItems(payload): Promise<{ restaurantId: string; visitId: string }>   // supabase.rpc, atomic
```

These signatures are the **contract** between tasks. Screen tasks (08/09) can mock them while the
data/auth/service tasks implement them.

## Coding conventions

- TypeScript strict; no `any` at module boundaries.
- Import from barrels, not deep paths.
- Supabase client created once in `src/lib/supabase.ts`; auth session persisted via AsyncStorage.
- UI components presentational; async logic in hooks/services.
- All DB writes go through `src/data` (and the RPC for the atomic save).
