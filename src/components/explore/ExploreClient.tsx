"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import type { Destination } from "@/lib/types";

interface ExploreClientProps {
  destinations: Destination[];
}

export function ExploreClient({ destinations }: ExploreClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [destinations, query]);

  function navigate(destination: Destination) {
    try {
      localStorage.setItem("exploreLocation", JSON.stringify(destination.position));
    } catch {
      // ignore storage errors
    }
    router.push("/home");
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    if (filtered.length > 0) navigate(filtered[0]);
  }

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5">
        <div className="py-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#333] sm:text-4xl">
            Explore India&apos;s Destinations
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#666]">
            Discover amazing places across India from ancient temples to modern attractions
          </p>
        </div>

        <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-[#999]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a city, attraction, or restaurant…"
              className="w-full rounded-lg border border-black/15 py-2.5 pl-10 pr-24 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="absolute right-1.5 rounded-md bg-primary-dark px-4 py-1.5 text-sm font-medium text-white transition hover:bg-black"
            >
              Search
            </button>
          </div>
        </form>

        {destinations.length === 0 ? (
          <p className="py-16 text-center text-[#999]">
            No destinations found. Please check back later.
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-[#999]">
            No matching destinations found. Try searching for Delhi, Mumbai, Jaipur, etc.
          </p>
        ) : (
          <div className="grid gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((destination) => (
              <button
                key={destination.id}
                type="button"
                onClick={() => navigate(destination)}
                className="group overflow-hidden rounded-xl bg-white text-left shadow-card transition-all hover:-translate-y-1.5 hover:shadow-cardLg"
              >
                <div className="relative h-48">
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-xl font-semibold text-white">
                      {destination.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-3 text-sm text-[#999]">{destination.description}</p>
                  <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-dark py-2 text-sm text-white transition group-hover:bg-white group-hover:text-primary-dark">
                    <MapPin className="h-4 w-4" />
                    Explore
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
