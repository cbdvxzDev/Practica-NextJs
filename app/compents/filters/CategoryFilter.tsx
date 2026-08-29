"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CategoryItem {
  id: string; // 'all' para limpiar filtros y ver todo
  label: string;
}

export interface CategoryFiltersProps {
  categories: CategoryItem[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  className?: string;
}

export function CategoryFilters({
  categories,
  selectedCategoryId,
  onSelectCategory,
  className,
}: CategoryFiltersProps) {
  
  // Garantizar que siempre exista una opción por defecto para "Ver todo" si no viene en el arreglo
  const fullCategories = React.useMemo(() => {
    const hasAll = categories.some((cat) => cat.id === "all");
    if (hasAll) return categories;
    return [{ id: "all", label: "Ver todo" }, ...categories];
  }, [categories]);

  return (
    <div 
      className={cn(
        // Contenedor con scroll horizontal fluido en móvil y fijo/alineado en escritorio
        "flex w-full flex-wrap items-center gap-2 pb-1",
        className
      )}
    >
      {fullCategories.map((category) => {
        const isActive = selectedCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              // Estilizado minimalista en alta/baja: botones compactos de altura reducida
              "h-10 flex-1 px-3 text-xs font-medium rounded-button transition-all duration-200 whitespace-nowrap focus:outline-none sm:flex-none sm:px-4",
              isActive
                ? "bg-brand-dark text-white font-semibold shadow-subtle"
                : "bg-neutral-50 text-brand-muted border border-border/40 hover:text-brand-dark hover:bg-brand-light"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}