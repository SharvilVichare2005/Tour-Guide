"use client";

import { useMemo, useState } from "react";
import { Categories } from "@/components/home/Categories";
import { NearbyPlaces } from "@/components/home/NearbyPlaces";
import { MapView } from "@/components/home/MapView";
import { PlaceDetailModal } from "@/components/home/PlaceDetailModal";
import type { LatLng, Place, PlaceCategory } from "@/lib/types";

interface HomeClientProps {
  places: Place[];
}

export function HomeClient({ places }: HomeClientProps) {
  const [filter, setFilter] = useState<PlaceCategory | "all">("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [directionTarget, setDirectionTarget] = useState<LatLng | null>(null);

  const filteredPlaces = useMemo(() => {
    if (filter === "all") return places;
    return places.filter((place) => place.type === filter);
  }, [places, filter]);

  function handleSelectPlace(place: Place) {
    setSelectedPlace(place);
    setDirectionTarget(place.location);
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5">
        <div className="py-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#333] sm:text-4xl">
            Discover Amazing Places in India
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#666]">
            LocalGuide helps you find the best attractions, restaurants, and hidden gems
            within 5km of your location.
          </p>
        </div>

        <div className="grid gap-6 pb-12 lg:grid-cols-[360px_1fr]">
          <aside className="flex flex-col gap-6">
            <Categories active={filter} onSelect={setFilter} />
            <NearbyPlaces
              places={filteredPlaces}
              filter={filter}
              onFilterChange={setFilter}
              onSelectPlace={handleSelectPlace}
            />
          </aside>

          <MapView
            places={filteredPlaces}
            directionTarget={directionTarget}
            onSelectPlace={handleSelectPlace}
          />
        </div>
      </section>

      <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </main>
  );
}
