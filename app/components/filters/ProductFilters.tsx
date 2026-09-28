"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { CategoryFilters, type CategoryItem } from "./CategoryFilter";
import { PriceFilter, type PriceRange } from "./PriceFilter";
import { SizeFilter } from "./SizeFilter";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { ActiveFilters, type ActiveFilterChip } from "./ActiveFilters";
import { FilterSection } from "./FilterSection";

export interface ProductFiltersProps {
  categories: CategoryItem[];
  /** Tallas presentes en el catálogo; se calcula arriba para no mostrar grupos vacíos. */
  sizes: string[];
}

const FILTER_KEYS = ["q", "category", "size", "minPrice", "maxPrice", "inStock", "sale"] as const;

export function ProductFilters({ categories, sizes }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Cualquier cambio de filtro vuelve a la primera página: si no, se puede
      // quedar en una página que ya no tiene resultados.
      if (!("page" in updates)) params.delete("page");
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    },
    [pathname, router, searchParams]
  );

  const selectedCategoryId = searchParams.get("category") || "all";
  const query = searchParams.get("q") || "";
  const selectedSizes = React.useMemo(
    () => (searchParams.get("size") || "").split(",").filter(Boolean),
    [searchParams]
  );
  const inStockOnly = searchParams.get("inStock") === "1";
  const onSaleOnly = searchParams.get("sale") === "1";

  // En useMemo porque si no el objeto cambia en cada render y arrastra a los
  // useMemo de abajo (chips) a recalcularse siempre.
  const initialRange = React.useMemo<PriceRange | undefined>(
    () =>
      searchParams.get("minPrice") || searchParams.get("maxPrice")
        ? {
            min: Number(searchParams.get("minPrice")) || 0,
            max: Number(searchParams.get("maxPrice")) || 9999999,
          }
        : undefined,
    [searchParams]
  );

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    updateParams({ size: next.join(",") || null });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    FILTER_KEYS.forEach((key) => params.delete(key));
    params.delete("page");
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  /* Los chips se derivan de la URL, no de estado local, para que el botón
     atrás del navegador y un enlace compartido muestren lo mismo. */
  const chips = React.useMemo<ActiveFilterChip[]>(() => {
    const list: ActiveFilterChip[] = [];

    if (query) list.push({ key: "q", label: `"${query}"` });
    if (selectedCategoryId !== "all") {
      const match = categories.find((c) => c.id === selectedCategoryId);
      list.push({ key: "category", label: match?.label ?? selectedCategoryId });
    }
    selectedSizes.forEach((size) =>
      list.push({ key: "size", value: size, label: size === "Única" ? "Talla única" : `Talla ${size}` })
    );
    if (initialRange) {
      const { min, max } = initialRange;
      const format = (v: number) => `$${(v / 1000).toFixed(0)}k`;
      list.push({
        key: "price",
        label: min === 0 ? `Hasta ${format(max)}` : max === 9999999 ? `Desde ${format(min)}` : `${format(min)} - ${format(max)}`,
      });
    }
    if (inStockOnly) list.push({ key: "inStock", label: "Solo en stock" });
    if (onSaleOnly) list.push({ key: "sale", label: "Solo ofertas" });

    return list;
  }, [categories, initialRange, inStockOnly, onSaleOnly, query, selectedCategoryId, selectedSizes]);

  const removeChip = (chip: ActiveFilterChip) => {
    if (chip.key === "size" && chip.value) {
      updateParams({ size: selectedSizes.filter((s) => s !== chip.value).join(",") || null });
      return;
    }
    if (chip.key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
      return;
    }
    updateParams({ [chip.key]: null });
  };

  return (
    <div className="space-y-6">
      <SearchBar
        initialValue={query}
        onSearch={(value) => updateParams({ q: value || null })}
      />

      <ActiveFilters chips={chips} onRemove={removeChip} onClearAll={clearAll} />

      <FilterSection title="Categoría">
        <CategoryFilters
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => updateParams({ category: id === "all" ? null : id })}
        />
      </FilterSection>

      <hr className="border-border/60" />

      <FilterSection title="Talla">
        <SizeFilter sizes={sizes} selected={selectedSizes} onToggle={toggleSize} />
      </FilterSection>

      <hr className="border-border/60" />

      <FilterSection title="Precio">
        <PriceFilter
          initialRange={initialRange}
          onPriceChange={(range) =>
            updateParams({
              minPrice: range.min ? String(range.min) : null,
              maxPrice: range.max === 9999999 ? null : String(range.max),
            })
          }
        />
      </FilterSection>

      <hr className="border-border/60" />

      <FilterSection title="Disponibilidad">
        <AvailabilityFilter
          inStockOnly={inStockOnly}
          onSaleOnly={onSaleOnly}
          onChange={(next) =>
            updateParams({
              // Ojo: el estado se llama inStockOnly/onSaleOnly pero los params
              // de la URL son inStock/sale.
              inStock: next.inStockOnly === undefined ? null : next.inStockOnly ? "1" : null,
              sale: next.onSaleOnly === undefined ? null : next.onSaleOnly ? "1" : null,
            })
          }
        />
      </FilterSection>
    </div>
  );
}
