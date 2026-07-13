"use client";

import { Star, MapPin, Navigation } from "lucide-react";
import { NEARBY_FILTERS, type Place, type PlaceCategory } from "@/lib/types";

interface NearbyPlacesProps {
  places: Place[];
  filter: PlaceCategory | "all";
  onFilterChange: (filter: PlaceCategory | "all") => void;
  onSelectPlace: (place: Place) => void;
}

export function NearbyPlaces({
  places,
  filter,
  onFilterChange,
  onSelectPlace,
}: NearbyPlacesProps) {
  return (
    <div className="card flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light/20 text-primary">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold leading-tight text-[#333]">
              Nearby Places
            </h3>
            <p className="text-xs text-[#999]">Within 5km of you</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
          {places.length}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {NEARBY_FILTERS.map((tab) => {
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange(tab.value)}
              className={
                isActive
                  ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
                  : "rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-[#666] transition-all hover:-translate-y-0.5 hover:bg-primary-light/20 hover:text-primary"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {places.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <MapPin className="h-5 w-5 text-[#bbb]" />
          </span>
          <p className="text-sm font-medium text-[#666]">No places found</p>
          <p className="text-xs text-[#999]">Try a different category</p>
        </div>
      ) : (
        <div className="flex max-h-[440px] flex-col gap-2.5 overflow-y-auto pr-1 nearby-scroll">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place)}
              className="group flex gap-3 rounded-xl border border-black/5 bg-white p-2.5 text-left transition-all hover:border-primary/30 hover:bg-secondary/40 hover:shadow-card"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={place.image}
                  alt={place.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-light to-primary-dark" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-[#333]">
                    {place.name}
                  </h4>
                  <span className="flex flex-shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {place.rating}
                  </span>
                </div>

                <p className="flex items-center gap-1 truncate text-xs text-[#999]">
                  <span className="capitalize text-primary-dark">{place.type}</span>
                  <span>•</span>
                  <span className="truncate">{place.vicinity}</span>
                </p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <Navigation className="h-3 w-3" />
                    View
                  </span>
                  <span className="ml-auto text-xs font-bold text-[#666]">
                    {place.distance ? `${place.distance} km` : "—"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
