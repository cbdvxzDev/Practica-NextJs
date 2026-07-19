"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SortOption {
  value: string;
  label: string;
}

export interface SortSelectProps {
  onSortChange: (value: string) => void;
  currentSort: string;
  options?: SortOption[];
  className?: string;
}

// Opciones estándar editoriales de ordenamiento comercial
const DEFAULT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Destacados" },
  { value: "newest", label: "Novedades" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
];

export function SortSelect({
  onSortChange,
  currentSort,
  options = DEFAULT_OPTIONS,
  className,
}: SortSelectProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value);
  };

  return (
    <div className={cn("relative flex items-center max-w-xs", className)}>
      {/* 1. ETIQUETA INTERNA DISCRETA (LEAD TEXT) */}
      <label 
        htmlFor="sort-select" 
        className="absolute left-3 text-[11px] font-medium uppercase tracking-wider text-brand-muted pointer-events-none select-none"
      >
        Ordenar por:
      </label>

      {/* 2. SELECTOR ESTILIZADO */}
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="h-10 w-full pl-[94px] pr-9 text-xs font-medium border border-border/60 rounded-button bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark transition-all cursor-pointer appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-brand-dark bg-white">
            {option.label}
          </option>
        ))}
      </select>

      {/* 3. ÍCONO SUTIL DE FLECHA EDITORIAL DE CONTROL (DERECHA) */}
      <span className="absolute right-3 flex items-center pointer-events-none text-brand-muted/70">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}