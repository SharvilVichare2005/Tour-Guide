"use client";

import { Star, MapPin } from "lucide-react";
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
    <div className="card">
      <h3 className="mb-3 text-lg font-semibold text-[#333]">Nearby Places</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        {NEARBY_FILTERS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === tab.value
                ? "bg-primary text-white shadow-md"
                : "bg-primary-light/30 text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {places.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#999]">
          No places found in this category
        </p>
      ) : (
        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place)}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-black/5 bg-gradient-to-b from-white to-white/0 p-2 text-left transition-all hover:-translate-y-1 hover:shadow-cardLg"
            >
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-primary-light to-primary-dark" />
              <img
                src={place.image}
                alt={place.name}
                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover shadow-sm"
              />
              <div className="flex w-full flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-[#333]">
                    {place.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-light to-primary px-2 py-0.5 text-xs font-bold text-black">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {place.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#999]">
                  <span className="capitalize">{place.type}</span>
                  <span>• {place.vicinity}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white opacity-90 transition group-hover:opacity-100">
                    View
                  </span>
                  <span className="text-xs font-medium text-primary">
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
