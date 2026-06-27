// Domain types + snake_case <-> camelCase mapping helpers for the data layer.
// DB columns are snake_case (see supabase/migrations/0001_init.sql);
// domain types are camelCase with string uuid ids.

export type RestaurantSource = 'osm' | 'manual';

export type Restaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  osmId?: string;
  source: RestaurantSource;
  createdAt: string;
};

export type Visit = {
  id: string;
  restaurantId: string;
  visitedAt: string;
  notes?: string;
};

export type OrderedItem = {
  id: string;
  visitId: string;
  name: string;
  price?: number;
  rating?: number;
  notes?: string;
};

/** Pagination wrapper returned by all paginated list functions. */
export type Page<T> = { rows: T[]; nextOffset: number | null };

// --- Raw row shapes (as returned by Supabase, snake_case) ---

export type RestaurantRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  osm_id: string | null;
  source: RestaurantSource;
  created_at: string;
};

export type VisitRow = {
  id: string;
  restaurant_id: string;
  visited_at: string;
  notes: string | null;
};

export type OrderedItemRow = {
  id: string;
  visit_id: string;
  name: string;
  price: number | null;
  rating: number | null;
  notes: string | null;
};

// --- Row -> domain mappers (drop nulls in favour of optional fields) ---

export function mapRestaurant(row: RestaurantRow): Restaurant {
  const restaurant: Restaurant = {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    source: row.source,
    createdAt: row.created_at,
  };
  if (row.address != null) {
    restaurant.address = row.address;
  }
  if (row.osm_id != null) {
    restaurant.osmId = row.osm_id;
  }
  return restaurant;
}

export function mapVisit(row: VisitRow): Visit {
  const visit: Visit = {
    id: row.id,
    restaurantId: row.restaurant_id,
    visitedAt: row.visited_at,
  };
  if (row.notes != null) {
    visit.notes = row.notes;
  }
  return visit;
}

export function mapOrderedItem(row: OrderedItemRow): OrderedItem {
  const item: OrderedItem = {
    id: row.id,
    visitId: row.visit_id,
    name: row.name,
  };
  if (row.price != null) {
    item.price = row.price;
  }
  if (row.rating != null) {
    item.rating = row.rating;
  }
  if (row.notes != null) {
    item.notes = row.notes;
  }
  return item;
}
