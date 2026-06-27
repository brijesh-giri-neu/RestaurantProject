import {
  mapRestaurant,
  mapVisit,
  mapOrderedItem,
} from '../../src/data/types';
import type {
  RestaurantRow,
  VisitRow,
  OrderedItemRow,
} from '../../src/data/types';
import type { AddVisitPayload } from '../../src/data/addVisitWithItems';

describe('row -> domain mappers', () => {
  describe('mapRestaurant', () => {
    it('maps snake_case columns to camelCase fields', () => {
      const row: RestaurantRow = {
        id: 'r1',
        name: 'Pizza Place',
        latitude: 1.23,
        longitude: 4.56,
        address: '1 Main St',
        osm_id: 'node/42',
        source: 'osm',
        created_at: '2026-01-01T00:00:00Z',
      };

      expect(mapRestaurant(row)).toEqual({
        id: 'r1',
        name: 'Pizza Place',
        latitude: 1.23,
        longitude: 4.56,
        address: '1 Main St',
        osmId: 'node/42',
        source: 'osm',
        createdAt: '2026-01-01T00:00:00Z',
      });
    });

    it('drops null optional fields instead of carrying nulls', () => {
      const row: RestaurantRow = {
        id: 'r2',
        name: 'Diner',
        latitude: 0,
        longitude: 0,
        address: null,
        osm_id: null,
        source: 'manual',
        created_at: '2026-01-02T00:00:00Z',
      };

      const mapped = mapRestaurant(row);
      expect(mapped).not.toHaveProperty('address');
      expect(mapped).not.toHaveProperty('osmId');
      expect(mapped).toEqual({
        id: 'r2',
        name: 'Diner',
        latitude: 0,
        longitude: 0,
        source: 'manual',
        createdAt: '2026-01-02T00:00:00Z',
      });
    });
  });

  describe('mapVisit', () => {
    it('maps snake_case columns and keeps notes when present', () => {
      const row: VisitRow = {
        id: 'v1',
        restaurant_id: 'r1',
        visited_at: '2026-02-01T12:00:00Z',
        notes: 'great meal',
      };

      expect(mapVisit(row)).toEqual({
        id: 'v1',
        restaurantId: 'r1',
        visitedAt: '2026-02-01T12:00:00Z',
        notes: 'great meal',
      });
    });

    it('drops null notes', () => {
      const row: VisitRow = {
        id: 'v2',
        restaurant_id: 'r2',
        visited_at: '2026-02-02T12:00:00Z',
        notes: null,
      };

      const mapped = mapVisit(row);
      expect(mapped).not.toHaveProperty('notes');
      expect(mapped.restaurantId).toBe('r2');
    });
  });

  describe('mapOrderedItem', () => {
    it('maps snake_case columns and keeps all optional fields when present', () => {
      const row: OrderedItemRow = {
        id: 'i1',
        visit_id: 'v1',
        name: 'Margherita',
        price: 12.5,
        rating: 4,
        notes: 'classic',
      };

      expect(mapOrderedItem(row)).toEqual({
        id: 'i1',
        visitId: 'v1',
        name: 'Margherita',
        price: 12.5,
        rating: 4,
        notes: 'classic',
      });
    });

    it('drops null optional fields', () => {
      const row: OrderedItemRow = {
        id: 'i2',
        visit_id: 'v2',
        name: 'Water',
        price: null,
        rating: null,
        notes: null,
      };

      const mapped = mapOrderedItem(row);
      expect(mapped).not.toHaveProperty('price');
      expect(mapped).not.toHaveProperty('rating');
      expect(mapped).not.toHaveProperty('notes');
      expect(mapped).toEqual({ id: 'i2', visitId: 'v2', name: 'Water' });
    });

    it('keeps a zero price (only nulls are dropped)', () => {
      const row: OrderedItemRow = {
        id: 'i3',
        visit_id: 'v3',
        name: 'Free Bread',
        price: 0,
        rating: null,
        notes: null,
      };

      expect(mapOrderedItem(row).price).toBe(0);
    });
  });
});

describe('AddVisitPayload shape', () => {
  it('accepts a fully-populated payload', () => {
    const payload: AddVisitPayload = {
      restaurant: {
        name: 'Pizza Place',
        latitude: 1.23,
        longitude: 4.56,
        address: '1 Main St',
        osmId: 'node/42',
        source: 'osm',
      },
      visitedAt: '2026-03-01T00:00:00Z',
      notes: 'birthday dinner',
      items: [
        { name: 'Margherita', price: 12.5, rating: 5, notes: 'great' },
        { name: 'Water' },
      ],
    };

    expect(payload.restaurant.source).toBe('osm');
    expect(payload.items).toHaveLength(2);
    expect(payload.items[1]).toEqual({ name: 'Water' });
  });

  it('accepts a minimal payload (only required fields)', () => {
    const payload: AddVisitPayload = {
      restaurant: {
        name: 'Diner',
        latitude: 0,
        longitude: 0,
        source: 'manual',
      },
      items: [{ name: 'Coffee' }],
    };

    expect(payload.visitedAt).toBeUndefined();
    expect(payload.notes).toBeUndefined();
    expect(payload.restaurant.source).toBe('manual');
  });
});
