export type PlaceCategory =
  | "restaurant"
  | "attraction"
  | "temple"
  | "park"
  | "cafe"
  | "shopping";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceCategory | string;
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

export const PLACE_CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: "restaurant", label: "Restaurants" },
  { value: "attraction", label: "Attractions" },
  { value: "temple", label: "Temples" },
  { value: "park", label: "Parks" },
  { value: "cafe", label: "Cafes" },
  { value: "shopping", label: "Shopping" },
];

export const NEARBY_FILTERS: { value: PlaceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "restaurant", label: "Food" },
  { value: "attraction", label: "Sights" },
  { value: "temple", label: "Temples" },
];
