# Task 08 — Add Visit Form Screen

**Owner:** subagent-form · **Depends on:** task-03, task-04, task-06, task-07 · **Parallel with:** task-09

## Objective
Build the core form: auto-fill GPS + restaurant name, capture ordered items, save to Supabase.

## Files to create
- `src/features/visits/validation/visitSchema.ts` — zod schema:
  - restaurant: `name` (required), `latitude`, `longitude` (required numbers), `address?`, `osmId?`, `source`.
  - `items`: array (min 1) of `{ name (required), price?, rating? (1-5), notes? }`.
  - `notes?` for the visit. Export inferred `VisitFormValues`.
- `src/features/visits/hooks/useCurrentLocation.ts` — wraps `getCurrentLocation()`; `{ coords, loading, error, refresh }`.
- `src/features/visits/hooks/useNearbyRestaurants.ts` — given coords, calls `placesService`; candidates + loading.
- `src/features/visits/hooks/useAddVisit.ts` — calls `data.addVisitWithItems()`; `{ submit, saving, error }`.
- `src/features/visits/components/OrderedItemRow.tsx` — one item row (name/price/rating/notes + remove).
- `src/features/visits/components/RestaurantSuggestionList.tsx` — tappable nearby candidates filling name/coords/osmId.
- `src/features/visits/screens/AddVisitScreen.tsx` — react-hook-form wiring; replaces task-07 placeholder.

## Behaviour
1. On mount: get location → fill lat/lng (+accuracy); fetch nearby restaurants → show suggestions; tap fills name + osmId + `source: 'osm'`.
2. Name editable; manual edit → `source: 'manual'`.
3. Ordered items: dynamic list (add/remove), at least one required.
4. Submit: validate → `addVisitWithItems` → success alert → reset or navigate to Lookup.

## Acceptance criteria
- GPS auto-fills on open; OSM suggestions appear and are selectable; name editable.
- Submitting persists restaurant (deduped) + visit + items for the logged-in user.
- Validation errors inline; submit disabled while saving.
- No direct imports of Supabase/geolocation/fetch — only services/data/hooks.
