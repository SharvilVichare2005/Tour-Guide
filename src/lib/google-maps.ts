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
  source: "gps" | "wifi" | "google-api" | "manual";
  /** True when the fix is IP-based and likely inaccurate (accuracy > 1km). */
  inaccurate: boolean;
}

/** Accuracy threshold (meters) above which a fix is considered IP-based/unreliable. */
const INACCURATE_THRESHOLD = 1000;

/**
 * Automatic location detection for every user:
 * 1. Browser geolocation (GPS on mobile, Wi-Fi/IP on desktop) — the standard,
 *    automatic path that prompts the user for permission once.
 * 2. Google Maps Geolocation API (IP-based) — fallback if the browser denies
 *    or times out, so we still get an approximate location automatically.
 * Marks fixes with accuracy > 1km as `inaccurate` (IP-based) so the UI can warn
 * the user instead of silently showing a wrong location.
 */
export async function detectUserLocation(): Promise<DetectedLocation> {
  // Layer 1: browser geolocation (works automatically once permission granted)
  try {
    const pos = await getCurrentPosition();
    const acc = pos.coords.accuracy ?? 0;
    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    // GPS (<100m) or Wi-Fi (~100-500m) are trustworthy. Anything > 1km is
    // IP-based and often the wrong city on desktops without location services.
    if (acc > 0 && acc < 100) {
      return { location, accuracy: acc, source: "gps", inaccurate: false };
    }
    if (acc > 0 && acc < INACCURATE_THRESHOLD) {
      return { location, accuracy: acc, source: "wifi", inaccurate: false };
    }
    // Low-accuracy IP fix — still return it so the map shows something, but
    // flag it so the UI can warn the user it's approximate.
    return { location, accuracy: acc, source: "wifi", inaccurate: true };
  } catch (browserErr) {
    console.warn("Browser geolocation failed, trying Google Geolocation API:", browserErr);
  }

  // Layer 2: Google Maps Geolocation API (IP-based automatic fallback)
  try {
    const result = await googleGeolocate();
    return { ...result, source: "google-api", inaccurate: result.accuracy >= INACCURATE_THRESHOLD };
  } catch (apiErr) {
    console.warn("Google Maps Geolocation API failed:", apiErr);
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
    // Single high-accuracy request with a longer timeout. On mobile this gets
    // a precise GPS fix; on desktop with Windows Location Services enabled +
    // a Wi-Fi adapter it uses OS-level Wi-Fi positioning (accurate). If
    // Windows Location Services is OFF, this either times out or returns a
    // low-accuracy IP-based fix — detectUserLocation flags that case.
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
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
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 },
  );
  return () => navigator.geolocation.clearWatch(watchId);
}
