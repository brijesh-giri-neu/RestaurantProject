import { visitSchema } from '../../src/features/visits/validation/visitSchema';

function validPayload() {
  return {
    restaurant: {
      name: 'Pizza Place',
      latitude: 1.23,
      longitude: 4.56,
      source: 'osm' as const,
    },
    items: [{ name: 'Margherita', price: 12.5, rating: 4 }],
    notes: 'great meal',
  };
}

describe('visitSchema', () => {
  it('accepts a valid payload', () => {
    const result = visitSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it('fails when restaurant name is missing/empty', () => {
    const payload = validPayload();
    payload.restaurant.name = '';
    const result = visitSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(
        true,
      );
    }
  });

  it('fails when items array is empty', () => {
    const payload = validPayload();
    payload.items = [];
    const result = visitSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('items'))).toBe(
        true,
      );
    }
  });

  it('fails when an item rating is above 5', () => {
    const payload = validPayload();
    payload.items[0].rating = 6;
    const result = visitSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('fails when an item rating is below 1', () => {
    const payload = validPayload();
    payload.items[0].rating = 0;
    const result = visitSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('accepts ratings at the 1 and 5 boundaries', () => {
    const low = validPayload();
    low.items[0].rating = 1;
    expect(visitSchema.safeParse(low).success).toBe(true);

    const high = validPayload();
    high.items[0].rating = 5;
    expect(visitSchema.safeParse(high).success).toBe(true);
  });
});
