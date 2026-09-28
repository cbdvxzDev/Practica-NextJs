"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SizeFilterProps {
  /** Faceta de tallas calculada sobre el catálogo, no una lista fija. */
  sizes: string[];
  selected: string[];
  onToggle: (size: string) => void;
  className?: string;
}

/** Orden editorial de las tallas de ropa. */
const LETTER_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "Única"];

/**
 * El catálogo mezcla ropa y calzado, así que las tallas llegan como
 * "S".."XXL", combinadas ("S/M", "L/XL"), "Única" y numéricas ("38".."43").
 * Aplanarlas en un solo orden alfabético dejaba "38" mezclado con "L", así que
 * se separa en dos bloques y dentro de cada uno se usa el orden que espera el
 * cliente: de XS a XXL en ropa, y de menor a mayor en calzado.
 */
function sortSizes(sizes: string[]): string[] {
  const isNumeric = (s: string) => /^\d+$/.test(s.trim());

  const rank = (size: string) => {
    const exact = LETTER_ORDER.indexOf(size);
    if (exact !== -1) return exact;
    // Las combinadas ("S/M") se ordenan por su primera letra.
    const first = LETTER_ORDER.indexOf(size.split("/")[0]?.trim() ?? "");
    return first === -1 ? LETTER_ORDER.length : first;
  };

  const letters = sizes
    .filter((s) => !isNumeric(s))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  const numbers = sizes
    .filter(isNumeric)
    .sort((a, b) => Number(a) - Number(b));

  return [...letters, ...numbers];
}

/** "Única" se muestra developed para que se entienda sola en la pastilla. */
function label(size: string): string {
  return size === "Única" ? "Talla única" : size;
}

export function SizeFilter({ sizes, selected, onToggle, className }: SizeFilterProps) {
  if (sizes.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="group" aria-label="Tallas">
      {sortSizes(sizes).map((size) => {
        const isActive = selected.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => onToggle(size)}
            aria-pressed={isActive}
            className={cn(
              "min-w-11 h-8 px-3 text-xs font-medium rounded-button border transition-all",
              isActive
                ? "border-brand-dark bg-brand-dark text-white font-semibold"
                : "border-border/50 text-brand-muted hover:text-brand-dark hover:bg-brand-light"
            )}
          >
            {label(size)}
          </button>
        );
      })}
    </div>
  );
}
