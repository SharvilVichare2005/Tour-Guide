"use client";

import { Star, MapPin, Navigation, Sparkles, Loader2, AlertTriangle, Search } from "lucide-react";
import {
  NEARBY_FILTERS,
  RADIUS_OPTIONS,
  type NearbyCategory,
  type Place,
  type RadiusKm,
} from "@/lib/types";

interface NearbyPlacesProps {
  places: Place[];
  filter: NearbyCategory;
  onFilterChange: (filter: NearbyCategory) => void;
  radius: RadiusKm;
  onRadiusChange: (radius: RadiusKm) => void;
  onSelectPlace: (place: Place) => void;
  hasUserLocation: boolean;
  loading: boolean;
  error: string | null;
}

export function NearbyPlaces({
  places,
  filter,
  onFilterChange,
  radius,
  onRadiusChange,
  onSelectPlace,
  hasUserLocation,
  loading,
  error,
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
            <p className="text-xs text-[#999]">
              {hasUserLocation ? `Within ${radius} km of you` : "Waiting for your location"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary">
          {places.length}
        </span>
      </div>

      {/* Category filter pills */}
      <div className="mb-3 flex flex-wrap gap-2">
        {NEARBY_FILTERS.map((tab) => {
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange(tab.value)}
              className={
                isActive
                  ? "rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
                  : "rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-[#666] transition-all hover:-translate-y-0.5 hover:bg-primary-light/20 hover:text-primary"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Radius control */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold text-[#999]">Radius</span>
        <div className="flex flex-1 gap-1.5">
          {RADIUS_OPTIONS.map((r) => {
            const isActive = radius === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={
                  isActive
                    ? "flex-1 rounded-md bg-primary-dark px-2 py-1 text-xs font-bold text-white transition"
                    : "flex-1 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-[#666] transition hover:bg-primary-light/20 hover:text-primary"
                }
              >
                {r} km
              </button>
            );
          })}
        </div>
      </div>

      {/* States */}
      {!hasUserLocation && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <MapPin className="h-5 w-5 text-[#bbb]" />
          </span>
          <p className="text-sm font-medium text-[#666]">Locate yourself first</p>
          <p className="text-xs text-[#999]">
            Allow location access on the map to see places near you
          </p>
        </div>
      )}

      {hasUserLocation && error && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </span>
          <p className="text-sm font-medium text-[#666]">Couldn&apos;t load Google places</p>
          <p className="text-xs text-[#999]">{error}</p>
        </div>
      )}

      {hasUserLocation && !error && loading && places.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-[#666]">Finding places near you…</p>
        </div>
      )}

      {hasUserLocation && !error && !loading && places.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Search className="h-5 w-5 text-[#bbb]" />
          </span>
          <p className="text-sm font-medium text-[#666]">No places found within {radius} km</p>
          <p className="text-xs text-[#999]">Try a larger radius or a different category</p>
        </div>
      )}

      {places.length > 0 && (
        <div className="flex max-h-[440px] flex-col gap-2.5 overflow-y-auto pr-1 nearby-scroll">
          {places.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelectPlace(place)}
              className="group flex gap-3 rounded-xl border border-black/5 bg-white p-2.5 text-left transition-all hover:border-primary/30 hover:bg-secondary/40 hover:shadow-card"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                {place.image ? (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MapPin className="h-6 w-6 text-[#ccc]" />
                  </div>
                )}
                <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-light to-primary-dark" />
                {place.source === "curated" && (
                  <span className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                    <Sparkles className="h-2.5 w-2.5" />
                    Featured
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-[#333]">
                    {place.name}
                  </h4>
                  {place.rating > 0 && (
                    <span className="flex flex-shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {place.rating}
                    </span>
                  )}
                </div>

                <p className="flex items-center gap-1 truncate text-xs text-[#999]">
                  <span className="capitalize text-primary-dark">{place.category}</span>
                  {place.vicinity && (
                    <>
                      <span>•</span>
                      <span className="truncate">{place.vicinity}</span>
                    </>
                  )}
                </p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <Navigation className="h-3 w-3" />
                    View
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    {place.source === "google" && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                        via Google
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#666]">
                      {place.distance != null ? `${place.distance.toFixed(1)} km` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
