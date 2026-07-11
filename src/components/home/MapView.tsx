"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, AlertTriangle } from "lucide-react";
import {
  loadGoogleMaps,
  getCurrentPosition,
  DEFAULT_LOCATION,
} from "@/lib/google-maps";
import type { LatLng, Place } from "@/lib/types";

interface MapViewProps {
  places: Place[];
  directionTarget: LatLng | null;
  onSelectPlace: (place: Place) => void;
}

const USER_ICON = {
  path: 0, // google.maps.SymbolPath.CIRCLE
  scale: 8,
  fillColor: "#4285F4",
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: "#ffffff",
};

export function MapView({ places, directionTarget, onSelectPlace }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const userLocationRef = useRef<LatLng | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const onSelectRef = useRef(onSelectPlace);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onSelectRef.current = onSelectPlace;
  }, [onSelectPlace]);

  // Initialize map once
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const googleLib = await loadGoogleMaps();
        if (!active || !containerRef.current) return;

        mapRef.current = new googleLib.maps.Map(containerRef.current, {
          center: DEFAULT_LOCATION,
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        try {
          const position = await getCurrentPosition();
          if (!active) return;
          userLocationRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapRef.current?.setCenter(userLocationRef.current);
          mapRef.current?.setZoom(14);
          addUserMarker(googleLib);
        } catch (err) {
          console.warn("Error getting location:", err);
        }

        setStatus("ready");
      } catch (err) {
        console.error("Failed to load Google Maps:", err);
        setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function addUserMarker(googleLib: typeof google) {
    if (!mapRef.current || !userLocationRef.current) return;
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    userMarkerRef.current = new googleLib.maps.Marker({
      position: userLocationRef.current,
      map: mapRef.current,
      title: "Your Location",
      icon: { ...USER_ICON, path: googleLib.maps.SymbolPath.CIRCLE },
    });
  }

  // Re-render markers when places change
  useEffect(() => {
    const googleLib = window.google;
    if (!googleLib?.maps || !mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    places.forEach((place) => {
      const marker = new googleLib.maps.Marker({
        position: place.location,
        map: mapRef.current,
        title: place.name,
      });
      marker.addListener("click", () => onSelectRef.current(place));
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
    try {
      const position = await getCurrentPosition();
      userLocationRef.current = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      mapRef.current.setCenter(userLocationRef.current);
      mapRef.current.setZoom(14);
      addUserMarker(googleLib);
    } catch (err) {
      console.warn("Error getting location:", err);
    }
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

      <button
        type="button"
        onClick={handleCenterMap}
        className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#333] shadow-md transition hover:bg-secondary"
      >
        <MapPin className="h-4 w-4" />
        Center Map
      </button>
    </div>
  );
}
