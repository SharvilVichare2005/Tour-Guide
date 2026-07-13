import { loadGoogleMaps } from "@/lib/google-maps";
import {
  NEARBY_CATEGORIES,
  haversineKm,
  type LatLng,
  type NearbyCategory,
  type Place,
} from "@/lib/types";

let serviceEl: HTMLDivElement | null = null;
let service: google.maps.places.PlacesService | null = null;

async function getPlacesService(): Promise<google.maps.places.PlacesService> {
  const google = await loadGoogleMaps();
  if (!service) {
    if (!serviceEl) {
      serviceEl = document.createElement("div");
      serviceEl.style.display = "none";
      document.body.appendChild(serviceEl);
    }
    service = new google.maps.places.PlacesService(serviceEl);
  }
  return service;
}

/** In-memory cache keyed by category+radius+rounded location to avoid refetches. */
const cache = new Map<string, Place[]>();

function cacheKey(category: NearbyCategory, radiusKm: number, loc: LatLng): string {
  return `${category}:${radiusKm}:${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}`;
}

function singleSearch(
  service: google.maps.places.PlacesService,
  location: LatLng,
  radiusM: number,
  type: string | null,
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius: radiusM,
      ...(type ? { type } : {}),
    };
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([]);
      } else {
        reject(new Error(`Places NearbySearch failed: ${status}`));
      }
    });
  });
}

function toPlace(
  result: google.maps.places.PlaceResult,
  category: NearbyCategory,
  userLocation: LatLng,
): Place {
  const loc: LatLng = {
    lat: result.geometry?.location?.lat() ?? 0,
    lng: result.geometry?.location?.lng() ?? 0,
  };
  const photoUrl = result.photos?.[0]?.getUrl({ maxWidth: 200 }) ?? "";
  return {
    id: `g-${result.place_id ?? result.name}`,
    name: result.name ?? "Unknown",
    type: category,
    category,
    source: "google",
    rating: result.rating ?? 0,
    image: photoUrl,
    googlePhotoUrl: photoUrl,
    vicinity: result.vicinity ?? result.formatted_address ?? "",
    location: loc,
    distance: haversineKm(userLocation, loc),
    placeId: result.place_id,
  };
}

/**
 * Fetch nearby places from Google Places Nearby Search (client-side, free).
 * For "all", fires all non-all category type queries in parallel and merges.
 * Results are sorted by distance (nearest first) and capped.
 */
export async function nearbySearch(
  userLocation: LatLng,
  category: NearbyCategory,
  radiusKm: number,
): Promise<Place[]> {
  const key = cacheKey(category, radiusKm, userLocation);
  const cached = cache.get(key);
  if (cached) return cached;

  const svc = await getPlacesService();
  const radiusM = Math.min(Math.round(radiusKm * 1000), 50000);

  const config = NEARBY_CATEGORIES.find((c) => c.value === category);
  const types = config?.googleTypes ?? [];

  // For "all" (no types), query every non-all category in parallel and merge.
  const typeQueries: (string | null)[] =
    types.length > 0 ? types : NEARBY_CATEGORIES.filter((c) => c.value !== "all").flatMap((c) => c.googleTypes);

  const queryCategory: NearbyCategory = category === "all" ? "all" : category;

  try {
    const batches = await Promise.all(
      typeQueries.map((t) => singleSearch(svc, userLocation, radiusM, t)),
    );
    const raw = batches.flat();

    // Dedupe by place_id, then map to Place.
    const seen = new Set<string>();
    const places: Place[] = [];
    for (const r of raw) {
      const pid = r.place_id ?? r.name;
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      // Assign the matching category for "all" results based on the place's types.
      const assignedCategory: NearbyCategory =
        queryCategory !== "all"
          ? queryCategory
          : inferCategoryFromGoogleTypes(r.types ?? []);
      places.push(toPlace(r, assignedCategory, userLocation));
    }

    // Sort nearest-first; cap to 40 to keep the list manageable.
    places.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    const capped = places.slice(0, 40);

    cache.set(key, capped);
    return capped;
  } catch (err) {
    console.warn("nearbySearch error:", err);
    throw err;
  }
}

/** Infer our NearbyCategory from a place's Google types (used for "all" results). */
function inferCategoryFromGoogleTypes(types: string[]): NearbyCategory {
  const set = new Set(types);
  for (const c of NEARBY_CATEGORIES) {
    if (c.value === "all") continue;
    if (c.googleTypes.some((t) => set.has(t))) return c.value;
  }
  return "sights";
}

/** Clear the in-memory cache (e.g. when the user's location changes significantly). */
export function clearPlacesCache(): void {
  cache.clear();
}
