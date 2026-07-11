"use client";

import { PLACE_CATEGORIES, type PlaceCategory } from "@/lib/types";

interface CategoriesProps {
  active: string;
  onSelect: (category: PlaceCategory | "all") => void;
}

export function Categories({ active, onSelect }: CategoriesProps) {
  return (
    <div className="card">
      <h3 className="mb-3 text-lg font-semibold text-[#333]">Categories</h3>
      <div className="grid grid-cols-2 gap-2">
        {PLACE_CATEGORIES.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onSelect(category.value)}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
              active === category.value
                ? "border-primary bg-primary text-white"
                : "border-primary bg-primary-dark text-white hover:bg-black"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
