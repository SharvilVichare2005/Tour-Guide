"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, AlertTriangle, Crosshair, LocateFixed, Pencil } from "lucide-react";
import {
  loadGoogleMaps,
  detectUserLocation,
  watchUserLocation,
  DEFAULT_LOCATION,
  type DetectedLocation,
} from "@/lib/google-maps";
import type { LatLng, Place } from "@/lib/types";

interface MapViewProps {
  places: Place[];
  directionTarget: LatLng | null;
  onSelectPlace: (place: Place) => void;
}

function createUserDotElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "user-marker";
  wrapper.innerHTML =
    '<span class="user-marker__pulse"></span><span class="user-marker__dot"></span>';
  return wrapper;
}

function createPlacePinElement(googleLib: typeof google): HTMLElement {
  const pin = new googleLib.maps.marker.PinElement({
    scale: 1.1,
    background: "#5E4FE2",
    borderColor: "#4A3ED1",
    glyphColor: "#ffffff",
  });
  return pin.element;
}

const SOURCE_LABELS: Record<DetectedLocation["source"], string> = {
  gps: "GPS",
  wifi: "Wi-Fi",
  "google-api": "Network",
  manual: "Manual",
};

export function MapView({ places, directionTarget, onSelectPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const userLocationRef = useRef<LatLng | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const onSelectRef = useRef(onSelectPlace);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [source, setSource] = useState<DetectedLocation["source"] | null>(null);
  const [inaccurate, setInaccurate] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  // Initialize map + detect user location automatically
  useEffect(() => {
    let active = true;
    let stopWatch: (() => void) | null = null;

    (async () => {
      try {
        const googleLib = await loadGoogleMaps();
        if (!active || !containerRef.current) return;

        const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
        mapRef.current = new googleLib.maps.Map(containerRef.current, {
          center: DEFAULT_LOCATION,
          zoom: 13,
          mapId,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        // Automatic detection — prompts the user for location permission once.
        try {
          const detected = await detectUserLocation();
          if (!active) return;
          applyLocation(googleLib, detected);
        } catch (err) {
          console.warn("Automatic location detection failed:", err);
          setLocationError(formatLocationError(err));
          setLocating(false);
        }

        // Live tracking — updates the marker as the user moves.
        stopWatch = watchUserLocation(
          (location, acc) => {
            if (!active) return;
            // Don't let a low-accuracy IP watch fix overwrite a manually-set
            // location. Only real GPS/Wi-Fi fixes (<1km) upgrade it.
            const isAccurate = acc > 0 && acc < 1000;
            const isManual = source === "manual";
            if (isManual && !isAccurate) return;

            const isFirstFix = !userLocationRef.current;
            userLocationRef.current = location;
            setUserCoords(location);
            setAccuracy(acc);
            setSource(acc > 0 && acc < 100 ? "gps" : "wifi");
            setInaccurate(!isAccurate);
            addUserMarker(window.google);
            updateAccuracyCircle(window.google, location, acc);
            if (isFirstFix) {
              mapRef.current?.setCenter(location);
              mapRef.current?.setZoom(isAccurate ? 15 : 12);
            }
            setLocationError(null);
            setLocating(false);
          },
          (error) => {
            if (!active) return;
            if (!userLocationRef.current) {
              setLocationError(formatLocationError(error));
              setLocating(false);
            }
          },
        );

        setStatus("ready");
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
        setStatus("error");
      }
    })();

    return () => {
      active = false;
      stopWatch?.();
    };
  }, []);

  function applyLocation(googleLib: typeof google, detected: DetectedLocation) {
    userLocationRef.current = detected.location;
    setUserCoords(detected.location);
    setAccuracy(detected.accuracy);
    setSource(detected.source);
    setInaccurate(detected.inaccurate);
    mapRef.current?.setCenter(detected.location);
    mapRef.current?.setZoom(detected.inaccurate ? 12 : 15);
    addUserMarker(googleLib);
    updateAccuracyCircle(googleLib, detected.location, detected.accuracy);
    setLocationError(null);
    setLocating(false);
  }

  function addUserMarker(googleLib: typeof google) {
    if (!mapRef.current || !userLocationRef.current) return;
    if (userMarkerRef.current) userMarkerRef.current.map = null;
    userMarkerRef.current = new googleLib.maps.marker.AdvancedMarkerElement({
      position: userLocationRef.current,
      map: mapRef.current,
      title: "Your Location",
      content: createUserDotElement(),
      zIndex: 999,
    });
  }

  function updateAccuracyCircle(googleLib: typeof google, loc: LatLng, acc: number) {
    if (!mapRef.current) return;
    if (accuracyCircleRef.current) accuracyCircleRef.current.setMap(null);
    if (!acc || acc <= 0) return;
    accuracyCircleRef.current = new googleLib.maps.Circle({
      center: loc,
      radius: acc,
      map: mapRef.current,
      fillColor: "#4285F4",
      fillOpacity: 0.12,
      strokeColor: "#4285F4",
      strokeOpacity: 0.4,
      strokeWeight: 1,
      clickable: false,
    });
  }

  // Re-render markers when places change
  useEffect(() => {
    const googleLib = window.google;
    if (!googleLib?.maps || !mapRef.current) return;

    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    places.forEach((place) => {
      const marker = new googleLib.maps.marker.AdvancedMarkerElement({
        position: place.location,
        map: mapRef.current,
        title: place.name,
        content: createPlacePinElement(googleLib),
      });
      marker.addEventListener("click", () => onSelectRef.current(place));
      markersRef.current.push(marker);
    });
  }, [places]);

  // Draw directions when directionTarget changes
  useEffect(() => {
    const googleLib = window.google;
    if (!googleLib?.maps || !mapRef.current) return;

    if (!directionTarget) {
      directionsRendererRef.current?.setMap(null);
      directionsRendererRef.current = null;
      return;
    }

    const userLocation = userLocationRef.current;
    if (!userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${directionTarget.lat},${directionTarget.lng}`;
      window.open(url, "_blank");
      return;
    }

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new googleLib.maps.DirectionsService();
    }
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new googleLib.maps.DirectionsRenderer();
      directionsRendererRef.current.setMap(mapRef.current);
    }

    directionsServiceRef.current.route(
      {
        origin: userLocation,
        destination: directionTarget,
        travelMode: googleLib.maps.TravelMode.DRIVING,
      },
      (result, routeStatus) => {
        if (routeStatus === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
        } else {
          console.warn("Directions request failed:", routeStatus);
          const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${directionTarget.lat},${directionTarget.lng}`;
          window.open(url, "_blank");
        }
      },
    );
  }, [directionTarget]);

  async function handleCenterMap() {
    const googleLib = window.google;
    if (!googleLib?.maps || !mapRef.current) return;
    setLocating(true);
    setLocationError(null);
    try {
      const detected = await detectUserLocation();
      applyLocation(googleLib, detected);
    } catch (err) {
      console.warn("Error getting location:", err);
      setLocationError(formatLocationError(err));
    } finally {
      setLocating(false);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const googleLib = window.google;
    if (!googleLib?.maps || !mapRef.current) return;
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setLocationError("Enter valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }
    applyLocation(googleLib, { location: { lat, lng }, accuracy: 0, source: "manual", inaccurate: false });
    setShowManual(false);
    setManualLat("");
    setManualLng("");
  }

  function formatLocationError(err: unknown): string {
    if (err instanceof GeolocationPositionError || (err && typeof err === "object" && "code" in err)) {
      const code = (err as GeolocationPositionError).code;
      if (code === 1) return "Location permission denied. Click the lock/location icon in the address bar, allow location access, then click Locate Me.";
      if (code === 2) return "Location unavailable. Make sure location services are enabled on your device, then click Locate Me.";
      if (code === 3) return "Location request timed out. Click Locate Me to try again.";
    }
    if (err instanceof Error) return err.message;
    return "Failed to get your location.";
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl shadow-card">
      <div ref={containerRef} className="h-full w-full" />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-secondary text-[#888]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading map…</span>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-[#888]">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p>Failed to load the map. Please try again later.</p>
        </div>
      )}

      {status === "ready" && locating && (
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-medium text-[#333] shadow-md">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Locating you…</span>
        </div>
      )}

      {locationError && status === "ready" && !showManual && (
        <div className="absolute left-4 right-4 top-4 z-10 flex max-w-md items-start gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs text-[#c0392b] shadow-md">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">{locationError}</span>
          <button
            type="button"
            onClick={handleCenterMap}
            className="ml-1 shrink-0 rounded-md bg-primary px-2 py-1 text-xs font-bold text-white transition hover:bg-primary-dark"
          >
            Locate Me
          </button>
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs font-bold text-primary transition hover:bg-primary-light/20"
          >
            Manual
          </button>
        </div>
      )}

      {showManual && status === "ready" && (
        <form
          onSubmit={handleManualSubmit}
          className="absolute left-4 right-4 top-4 z-10 flex max-w-md flex-col gap-2 rounded-lg bg-white/95 px-3 py-3 text-xs shadow-md"
        >
          <span className="font-semibold text-[#333]">Set your location manually</span>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 16.76133)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-black/10 px-2 py-1.5 text-xs text-[#333] outline-none focus:border-primary"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. 74.10492)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-black/10 px-2 py-1.5 text-xs text-[#333] outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="rounded-md bg-secondary px-3 py-1.5 text-xs font-bold text-[#666] transition hover:bg-primary-light/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-dark"
            >
              Set Location
            </button>
          </div>
        </form>
      )}

      {inaccurate && status === "ready" && !locating && !locationError && !showManual && (
        <div className="absolute left-4 right-4 top-4 z-10 flex max-w-md items-start gap-2 rounded-lg bg-amber-50/95 px-3 py-2 text-xs text-amber-700 shadow-md">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">
            Approximate location (IP-based). For an accurate location, enable location services on your device or set it manually.
          </span>
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="shrink-0 rounded-md bg-primary px-2 py-1 text-xs font-bold text-white transition hover:bg-primary-dark"
          >
            Set manually
          </button>
        </div>
      )}

      {status === "ready" && !locating && !locationError && !showManual && userCoords && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-0.5 rounded-lg bg-white/95 px-3 py-2 text-xs shadow-md">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3 w-3 text-primary" />
            <span className="font-semibold text-[#333]">Your live location</span>
            {source && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${inaccurate ? "bg-amber-100 text-amber-700" : "bg-primary-light/20 text-primary"}`}>
                {SOURCE_LABELS[source]}{inaccurate ? " (approx)" : ""}
              </span>
            )}
          </div>
          <span className="font-mono text-[#666]">
            {userCoords.lat.toFixed(5)}, {userCoords.lng.toFixed(5)}
          </span>
          {accuracy != null && accuracy > 0 && (
            <span className="text-[10px] text-[#999]">
              accuracy ±{Math.round(accuracy)} m
            </span>
          )}
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        {status === "ready" && !showManual && (
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#333] shadow-md transition hover:bg-secondary"
          >
            <Pencil className="h-4 w-4" />
            Set manually
          </button>
        )}
        <button
          type="button"
          onClick={handleCenterMap}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#333] shadow-md transition hover:bg-secondary"
        >
          <LocateFixed className="h-4 w-4 text-primary" />
          Locate Me
        </button>
      </div>
    </div>
  );
}
