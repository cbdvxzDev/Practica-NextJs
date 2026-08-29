"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortSelectProps {
  onSortChange?: (value: string) => void;
  currentSort: string;
  options?: SortOption[];
  className?: string;
}

// Opciones estándar editoriales de ordenamiento comercial
const DEFAULT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Destacados" },
  { value: "newest", label: "Novedades" },
  { value: "popular", label: "Más vendidos" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
];

export function SortSelect({
  onSortChange,
  currentSort,
  options = DEFAULT_OPTIONS,
  className,
}: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (onSortChange) {
      onSortChange(value);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn("flex w-full max-w-xs items-center gap-3", className)}>
      <label
        htmlFor="sort-select" 
        className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-brand-muted"
      >
        Ordenar por
      </label>

      <div className="relative min-w-0 flex-1">
        <select
          id="sort-select"
          value={currentSort}
          onChange={handleChange}
          className="h-10 w-full appearance-none rounded-button border border-border/60 bg-white px-3 pr-9 text-xs font-medium text-brand-dark transition-all focus:outline-none focus:ring-1 focus:ring-brand-dark"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-brand-dark">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-brand-muted/70">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </div>
  );
}