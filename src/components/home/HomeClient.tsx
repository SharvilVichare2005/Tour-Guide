"use client";

import { useEffect, useMemo, useState } from "react";
import { Categories } from "@/components/home/Categories";
import { NearbyPlaces } from "@/components/home/NearbyPlaces";
import { MapView } from "@/components/home/MapView";
import { PlaceDetailModal } from "@/components/home/PlaceDetailModal";
import { nearbySearch } from "@/lib/google-places";
import {
  categoryFromLegacyType,
  haversineKm,
  type LatLng,
  type NearbyCategory,
  type Place,
  type RadiusKm,
} from "@/lib/types";

interface HomeClientProps {
  places: Place[];
}

const DEFAULT_RADIUS: RadiusKm = 5;

/** Normalize curated places from Supabase: tag source + unified category. */
function normalizeCurated(places: Place[]): Place[] {
  return places.map((p) => ({
    ...p,
    source: "curated" as const,
    category: p.category ?? categoryFromLegacyType(String(p.type)),
    distance: null,
  }));
}

/** Drop Google places that overlap a curated place (same name, case-insensitive). */
function dedupeAgainstCurated(google: Place[], curated: Place[]): Place[] {
  const curatedNames = new Set(
    curated.map((p) => p.name.trim().toLowerCase()).filter(Boolean),
  );
  return google.filter((p) => !curatedNames.has(p.name.trim().toLowerCase()));
}

export function HomeClient({ places }: HomeClientProps) {
  const curatedPlaces = useMemo(() => normalizeCurated(places), [places]);

  const [filter, setFilter] = useState<NearbyCategory>("all");
  const [radius, setRadius] = useState<RadiusKm>(DEFAULT_RADIUS);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [googlePlaces, setGooglePlaces] = useState<Place[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [directionTarget, setDirectionTarget] = useState<LatLng | null>(null);

  // Fetch Google Places when location + filter + radius are known.
  useEffect(() => {
    if (!userLocation) return;
    let active = true;
    setGoogleLoading(true);
    setGoogleError(null);
    const handle = window.setTimeout(() => {
      nearbySearch(userLocation, filter, radius)
        .then((results) => {
          if (active) setGooglePlaces(results);
        })
        .catch((err) => {
          if (active) {
            setGooglePlaces([]);
            setGoogleError(err instanceof Error ? err.message : "Failed to load nearby places.");
          }
        })
        .finally(() => {
          if (active) setGoogleLoading(false);
        });
    }, 300); // debounce category/radius changes
    return () => {
      active = false;
      window.clearTimeout(handle);
    };
  }, [userLocation, filter, radius]);

  // Merged, filtered, sorted place list for display + map markers.
  const displayPlaces = useMemo<Place[]>(() => {
    const withinRadius = (p: Place): boolean => {
      if (!userLocation) return true; // before location known, show all curated
      const d = p.distance ?? (userLocation ? haversineKm(userLocation, p.location) : null);
      return d == null ? false : d <= radius;
    };

    const byCategory = (p: Place): boolean =>
      filter === "all" ? true : p.category === filter;

    // Attach distance to curated places once user location is known.
    const curatedWithDistance: Place[] = curatedPlaces.map((p) => ({
      ...p,
      distance: userLocation ? haversineKm(userLocation, p.location) : null,
    }));

    const curatedFiltered = curatedWithDistance
      .filter(withinRadius)
      .filter(byCategory)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    const googleFiltered = dedupeAgainstCurated(googlePlaces, curatedWithDistance)
      .filter(withinRadius)
      .filter(byCategory)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    return [...curatedFiltered, ...googleFiltered];
  }, [curatedPlaces, googlePlaces, userLocation, filter, radius]);

  function handleSelectPlace(place: Place) {
    setSelectedPlace(place);
    setDirectionTarget(place.location);
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5">
        <div className="py-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#333] sm:text-4xl">
            Discover Amazing Places Around You
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#666]">
            LocalGuide shows you the best attractions, restaurants, temples, and
            hidden gems within your chosen radius — powered by Google Places.
          </p>
        </div>

        <div className="grid gap-6 pb-12 lg:grid-cols-[360px_1fr]">
          <aside className="flex flex-col gap-6">
            <Categories active={filter} onSelect={setFilter} />
            <NearbyPlaces
              places={displayPlaces}
              filter={filter}
              onFilterChange={setFilter}
              radius={radius}
              onRadiusChange={setRadius}
              onSelectPlace={handleSelectPlace}
              hasUserLocation={Boolean(userLocation)}
              loading={googleLoading}
              error={googleError}
            />
          </aside>

          <MapView
            places={displayPlaces}
            directionTarget={directionTarget}
            onSelectPlace={handleSelectPlace}
            onUserLocation={setUserLocation}
          />
        </div>
      </section>

      <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </main>
  );
}
