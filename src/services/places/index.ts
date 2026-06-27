import { osmPlacesService } from './osmPlacesService';

import type { PlacesService } from './types';

export type { PlaceCandidate, PlacesService } from './types';

export const placesService: PlacesService = osmPlacesService;
