"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ActiveFilterChip {
  /** Clave del query param que se limpia al quitar el chip. */
  key: string;
  label: string;
  /** Para las tallas, que se guardan como lista en un solo param. */
  value?: string;
}

export interface ActiveFiltersProps {
  chips: ActiveFilterChip[];
  onRemove: (chip: ActiveFilterChip) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * Resumen de todo lo que está filtrando la página. Cada chip quita solo su
 * filtro y "Limpiar" los quita todos, para que el usuario nunca tenga que
 * desarmar la búsqueda a mano.
 */
export function ActiveFilters({ chips, onRemove, onClearAll, className }: ActiveFiltersProps) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-[11px] uppercase tracking-wider text-brand-muted">Filtros</span>

      {chips.map((chip) => (
        <button
          key={`${chip.key}:${chip.value ?? ""}`}
          type="button"
          onClick={() => onRemove(chip)}
          className="group inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full bg-brand-light text-brand-dark text-[11px] font-medium border border-brand-dark/10 hover:border-brand-dark/30 transition-colors"
        >
          <span className="max-w-40 truncate">{chip.label}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 shrink-0 text-brand-muted group-hover:text-brand-dark"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" d="M3 3l6 6M9 3l-6 6" />
          </svg>
          <span className="sr-only">Quitar filtro {chip.label}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="h-7 px-2 text-[11px] font-medium text-brand-muted underline underline-offset-4 hover:text-brand-dark transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  );
}
