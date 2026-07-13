export type LegacyPlaceType =
  | "restaurant"
  | "attraction"
  | "temple"
  | "park"
  | "cafe"
  | "shopping";

/** Unified nearby category used by the filter pills + Categories grid. */
export type NearbyCategory =
  | "all"
  | "sights"
  | "food"
  | "coffee"
  | "temples"
  | "parks"
  | "shopping";

export type PlaceSource = "curated" | "google";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  type: NearbyCategory | string;
  /** Unified category used for filtering (mapped from legacy type or set by Google fetch). */
  category: NearbyCategory;
  /** Origin of the place — curated (Supabase) or google (Places Nearby Search). */
  source: PlaceSource;
  rating: number;
  image: string;
  vicinity: string;
  description?: string;
  location: LatLng;
  hours?: string[];
  phone?: string;
  website?: string;
  photos?: string[];
  distance?: number | null;
  /** Google Places place_id (google source only). */
  placeId?: string;
  /** Single Google Places photo URL (google source only). */
  googlePhotoUrl?: string;
}

export interface Destination {
  id: string;
  title: string;
  image: string;
  description: string;
  position: LatLng;
}

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

/**
 * Unified nearby category config. Each entry maps our label to one or more
 * Google Places `type` strings used by the Nearby Search.
 */
export const NEARBY_CATEGORIES: {
  value: NearbyCategory;
  label: string;
  googleTypes: string[];
}[] = [
  { value: "all", label: "All", googleTypes: [] },
  { value: "sights", label: "Sights", googleTypes: ["tourist_attraction"] },
  { value: "food", label: "Food", googleTypes: ["restaurant"] },
  { value: "coffee", label: "Coffee", googleTypes: ["cafe"] },
  { value: "temples", label: "Temples", googleTypes: ["hindu_temple"] },
  { value: "parks", label: "Parks", googleTypes: ["park"] },
  { value: "shopping", label: "Shopping", googleTypes: ["shopping_mall"] },
];

/** Categories grid (excludes "all"). */
export const PLACE_CATEGORIES = NEARBY_CATEGORIES.filter(
  (c) => c.value !== "all",
).map((c) => ({ value: c.value, label: c.label }));

/** Filter pills (includes "all"). */
export const NEARBY_FILTERS = NEARBY_CATEGORIES;

/** Radius options in kilometers. */
export const RADIUS_OPTIONS = [1, 5, 10, 25] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS)[number];

/** Map legacy seeded `type` strings to the unified NearbyCategory. */
const LEGACY_TYPE_TO_CATEGORY: Record<string, NearbyCategory> = {
  restaurant: "food",
  attraction: "sights",
  temple: "temples",
  park: "parks",
  cafe: "coffee",
  shopping: "shopping",
};

export function categoryFromLegacyType(type: string): NearbyCategory {
  return LEGACY_TYPE_TO_CATEGORY[type] ?? "sights";
}

/** Great-circle distance between two coordinates in kilometers. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
