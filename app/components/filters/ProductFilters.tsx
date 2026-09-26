"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { CategoryFilters, type CategoryItem } from "./CategoryFilter";
import { PriceFilter, type PriceRange } from "./PriceFilter";

export interface ProductFiltersProps {
  categories: CategoryItem[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedCategoryId = searchParams.get("category") || "all";
  const initialRange: PriceRange | undefined =
    searchParams.get("minPrice") || searchParams.get("maxPrice")
      ? {
          min: Number(searchParams.get("minPrice")) || 0,
          max: Number(searchParams.get("maxPrice")) || 9999999,
        }
      : undefined;

  return (
    <>
      <SearchBar
        initialValue={searchParams.get("q") || ""}
        onSearch={(query) => updateParams({ q: query, page: null })}
      />

      <hr className="border-border/60" />

      <CategoryFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) =>
          updateParams({ category: id === "all" ? null : id, page: null })
        }
      />

      <hr className="border-border/60" />

      <PriceFilter
        initialRange={initialRange}
        onPriceChange={(range) =>
          updateParams({
            minPrice: range.min ? String(range.min) : null,
            maxPrice: range.max ? String(range.max) : null,
            page: null,
          })
        }
      />
    </>
  );
}