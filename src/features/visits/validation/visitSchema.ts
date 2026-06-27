import { z } from 'zod';

export const restaurantSourceSchema = z.enum(['osm', 'manual']);

export const restaurantSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name is required'),
  latitude: z.number({ message: 'Latitude is required' }),
  longitude: z.number({ message: 'Longitude is required' }),
  address: z.string().trim().optional(),
  osmId: z.string().trim().optional(),
  source: restaurantSourceSchema,
});

export const orderedItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  price: z
    .number({ message: 'Enter a valid price' })
    .nonnegative('Price cannot be negative')
    .optional(),
  rating: z
    .number({ message: 'Enter a valid rating' })
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  notes: z.string().trim().optional(),
});

export const visitSchema = z.object({
  restaurant: restaurantSchema,
  items: z.array(orderedItemSchema).min(1, 'Add at least one ordered item'),
  notes: z.string().trim().optional(),
});

export type VisitFormValues = z.infer<typeof visitSchema>;
export type OrderedItemFormValues = z.infer<typeof orderedItemSchema>;
