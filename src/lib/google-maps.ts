import { Loader } from "@googlemaps/js-api-loader";
import type { LatLng } from "@/lib/types";

let loaderPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!loaderPromise) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

    if (!apiKey) {
      return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set"));
    }

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loaderPromise = loader.load().then((googleLib) => {
      window.google = googleLib;
      return googleLib;
    });
  }

  return loaderPromise;
}

export const DEFAULT_LOCATION = { lat: 16.653957, lng: 74.262214 };

export interface DetectedLocation {
  location: LatLng;
  accuracy: number;
  source: "gps" | "wifi" | "google-api" | "manual" | "saved";
  /** True when the fix is IP-based and likely inaccurate (accuracy > 1km). */
  inaccurate: boolean;
}

/** Accuracy threshold (meters) above which a fix is considered IP-based/unreliable. */
const INACCURATE_THRESHOLD = 1000;

const SAVED_LOCATION_KEY = "localguide:saved-location";

/** Read a previously-saved trusted location (manual or a good GPS/Wi-Fi fix). */
export function getSavedLocation(): DetectedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.location?.lat === "number" &&
      typeof parsed?.location?.lng === "number"
    ) {
      return {
        location: parsed.location,
        accuracy: parsed.accuracy ?? 0,
        source: "saved",
        inaccurate: false,
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Persist a trusted location so it's reused on future visits automatically. */
export function saveLocation(loc: DetectedLocation): void {
  if (typeof window === "undefined") return;
  // Never persist inaccurate IP fixes — they're often the wrong city.
  if (loc.inaccurate) return;
  try {
    window.localStorage.setItem(
      SAVED_LOCATION_KEY,
      JSON.stringify({ location: loc.location, accuracy: loc.accuracy }),
    );
  } catch {
    /* ignore */
  }
}

export function clearSavedLocation(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SAVED_LOCATION_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Automatic location detection for every user:
 * 1. Saved trusted location (manual or prior good fix) — used instantly and
 *    PREFERRED over inaccurate IP fixes that would otherwise show the wrong
 *    city on desktops without GPS.
 * 2. Browser geolocation — only an accurate fix (<1km) overrides the saved
 *    location; an inaccurate IP fix is ignored if we already have a saved one.
 * 3. Google Maps Geolocation API — IP fallback, only used if nothing saved.
 * A real GPS/Wi-Fi fix always wins and gets persisted for next time.
 */
export async function detectUserLocation(): Promise<DetectedLocation> {
  const saved = getSavedLocation();

  // Layer 1: browser geolocation
  try {
    const pos = await getCurrentPosition();
    const acc = pos.coords.accuracy ?? 0;
    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (acc > 0 && acc < 100) {
      const detected = { location, accuracy: acc, source: "gps" as const, inaccurate: false };
      saveLocation(detected);
      return detected;
    }
    if (acc > 0 && acc < INACCURATE_THRESHOLD) {
      const detected = { location, accuracy: acc, source: "wifi" as const, inaccurate: false };
      saveLocation(detected);
      return detected;
    }
    // Inaccurate IP fix — use it ONLY if we have no trusted saved location.
    if (saved) {
      console.info("Ignoring inaccurate IP fix; using saved location");
      return saved;
    }
    return { location, accuracy: acc, source: "wifi", inaccurate: true };
  } catch (browserErr) {
    console.warn("Browser geolocation failed:", browserErr);
  }

  // Layer 2: Google Maps Geolocation API (IP fallback) — only if nothing saved.
  if (!saved) {
    try {
      const result = await googleGeolocate();
      return {
        ...result,
        source: "google-api",
        inaccurate: result.accuracy >= INACCURATE_THRESHOLD,
      };
    } catch (apiErr) {
      console.warn("Google Maps Geolocation API failed:", apiErr);
    }
  }

  // Layer 3: fall back to saved trusted location
  if (saved) {
    console.info("Using saved location from previous visit");
    return saved;
  }

  throw new Error("All location detection methods failed");
}

async function googleGeolocate(): Promise<{ location: LatLng; accuracy: number }> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
  const res = await fetch(
    `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ considerIp: true }) },
  );
  if (!res.ok) throw new Error(`Geolocation API returned ${res.status}`);
  const data = await res.json();
  if (!data?.location) throw new Error("Geolocation API returned no location");
  return { location: data.location, accuracy: data.accuracy ?? 5000 };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser"));
      return;
    }
    // Try high accuracy first (mobile GPS / desktop Wi-Fi). On desktops without
    // GPS or Windows Location Services, the high-accuracy request often times
    // out — fall back to a lenient low-accuracy request (IP-based) so we still
    // get a fix. detectUserLocation flags inaccurate fixes and prefers a saved
    // trusted location over them.
    let settled = false;
    const ok = (pos: GeolocationPosition) => {
      if (!settled) { settled = true; resolve(pos); }
    };
    const failHigh = () => {
      if (settled) return;
      navigator.geolocation.getCurrentPosition(ok, (lowErr) => {
        if (!settled) { settled = true; reject(lowErr); }
      }, { enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 });
    };
    navigator.geolocation.getCurrentPosition(ok, failHigh, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    });
  });
}

export function watchUserLocation(
  onUpdate: (location: LatLng, accuracy: number) => void,
  onError?: (error: GeolocationPositionError | Error) => void,
): () => void {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation not supported by this browser"));
    return () => {};
  }
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onUpdate(
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        position.coords.accuracy ?? 0,
      );
    },
    (error) => onError?.(error),
    { enableHighAccuracy: false, timeout: 30000, maximumAge: 5000 },
  );
  return () => navigator.geolocation.clearWatch(watchId);
}
