"use client";

import { useEffect, useRef, useState } from "react";
import {
  Star,
  X,
  MapPin,
  Clock,
  Phone,
  Globe,
  Bookmark,
  Navigation,
} from "lucide-react";
import { loadGoogleMaps } from "@/lib/google-maps";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { LatLng, Place } from "@/lib/types";
import { ExternalLink } from "lucide-react";

type Tab = "info" | "photos" | "map";

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

function MiniMap({ location, title }: { location: LatLng; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const google = await loadGoogleMaps();
      if (!active || !ref.current) return;
      const map = new google.maps.Map(ref.current, {
        center: location,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
      });
      new google.maps.Marker({ position: location, map, title });
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [location, title]);

  return (
    <div
      ref={ref}
      className={ready ? "h-48 w-full rounded-lg" : "h-48 w-full rounded-lg bg-secondary"}
    />
  );
}

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  const [tab, setTab] = useState<Tab>("info");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTab("info");
  }, [place?.id]);

  useEffect(() => {
    if (!place) return;
    const el = document.getElementById("place-detail-modal");
    if (el) el.focus();
  }, [place]);

  useEffect(() => {
    if (!place) return;
    let active = true;
    (async () => {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active || !user) return;
      const { data: saved } = await supabase
        .from("saved_places")
        .select("*")
        .eq("user_id", user.id)
        .eq("place_id", place.id)
        .single();
      if (active) setIsSaved(Boolean(saved));
    })();
    return () => {
      active = false;
    };
  }, [place]);

  if (!place) return null;

  // Light variant for Google Places (no rich curated data).
  if (place.source === "google") {
    const mapsUrl = place.placeId
      ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}`
      : `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
    return (
      <div
        id="place-detail-modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-cardLg"
        >
          <div className="relative h-48 flex-shrink-0 bg-secondary">
            {place.googlePhotoUrl || place.image ? (
              <img
                src={place.googlePhotoUrl || place.image}
                alt={place.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <MapPin className="h-10 w-10 text-[#ccc]" />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
              via Google
            </span>
          </div>

          <div className="overflow-y-auto p-4">
            <div className="mb-3">
              <h3 className="text-xl font-semibold text-[#333]">{place.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                {place.rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-semibold">{place.rating}</span>
                  </span>
                )}
                <span className="text-sm capitalize text-[#999]">{place.category}</span>
                {place.distance != null && (
                  <span className="text-sm font-semibold text-primary">
                    {place.distance.toFixed(1)} km away
                  </span>
                )}
              </div>
            </div>

            {place.vicinity && (
              <div className="mb-4 flex items-start gap-2 text-sm text-[#666]">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#999]" />
                <span>{place.vicinity}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDirections}
                className="flex-1 rounded-lg bg-primary-dark py-2.5 text-sm font-medium text-white transition hover:bg-[#3730a3]"
              >
                <Navigation className="mr-1 inline h-4 w-4" />
                Get Directions
              </button>
              <button
                type="button"
                onClick={() => window.open(mapsUrl, "_blank")}
                className="flex-1 rounded-lg border border-black/10 bg-white py-2.5 text-sm font-medium text-primary transition hover:bg-secondary"
              >
                <ExternalLink className="mr-1 inline h-4 w-4" />
                View on Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function toggleSave() {
    if (!place) return;
    setSaving(true);
    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to save places.");
        return;
      }

      if (isSaved) {
        await supabase
          .from("saved_places")
          .delete()
          .eq("user_id", user.id)
          .eq("place_id", place.id);
        setIsSaved(false);
        alert("Removed from saved places");
      } else {
        await supabase.from("saved_places").insert([
          { user_id: user.id, place_id: place.id },
        ]);
        setIsSaved(true);
        alert("Added to saved places!");
      }
    } catch (err) {
      console.error("Error saving place:", err);
      alert("Failed to save place. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDirections() {
    if (!place) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, "_blank");
  }

  return (
    <div
      id="place-detail-modal"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-cardLg"
      >
        <div className="relative h-48 flex-shrink-0">
          <img
            src={place.image}
            alt={place.name}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-[#333]">{place.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold">{place.rating}</span>
              </span>
              <span className="text-sm capitalize text-[#999]">{place.type}</span>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            {(["info", "photos", "map"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-primary text-white shadow-md"
                    : "bg-primary-dark text-white hover:bg-primary"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "info" && (
            <div>
              <p className="mb-4 text-sm text-[#666]">
                {place.description || "No description available."}
              </p>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#999]" />
                  <span>{place.vicinity}</span>
                </div>
                {place.hours && place.hours.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#999]" />
                    <div className="flex flex-col">
                      {place.hours.map((hour) => (
                        <span key={hour}>{hour}</span>
                      ))}
                    </div>
                  </div>
                )}
                {place.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#999]" />
                    <a href={`tel:${place.phone}`} className="text-primary hover:underline">
                      {place.phone}
                    </a>
                  </div>
                )}
                {place.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#999]" />
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {place.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "photos" && (
            <div>
              {place.photos && place.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {place.photos.map((photo) => (
                    <img
                      key={photo}
                      src={photo}
                      alt={`${place.name} photo`}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-[#999]">No photos available</p>
              )}
            </div>
          )}

          {tab === "map" && (
            <MiniMap location={place.location} title={place.name} />
          )}

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleDirections}
              className="flex-1 rounded-lg bg-primary-dark py-2.5 text-sm font-medium text-white transition hover:bg-[#3730a3]"
            >
              <Navigation className="mr-1 inline h-4 w-4" />
              Get Directions
            </button>
            <button
              type="button"
              onClick={toggleSave}
              disabled={saving}
              className="flex-1 rounded-lg border border-black/10 bg-primary-dark py-2.5 text-sm font-medium text-white transition hover:bg-[#3730a3] disabled:opacity-70"
            >
              <Bookmark className={`mr-1 inline h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
