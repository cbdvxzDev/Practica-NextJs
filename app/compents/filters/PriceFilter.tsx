"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PriceRange {
  min: number;
  max: number;
}

export interface PriceFilterProps {
  onPriceChange: (range: PriceRange) => void;
  initialRange?: PriceRange;
  className?: string;
}

// Rangos preestablecidos editoriales para selección rápida (COP sugerido)
const PRESET_RANGES = [
  { label: "Hasta $50k", min: 0, max: 50000 },
  { label: "$50k - $150k", min: 50000, max: 150000 },
  { label: "$150k - $300k", min: 150000, max: 300000 },
  { label: "Más de $300k", min: 300000, max: 9999999 },
];

export function PriceFilter({
  onPriceChange,
  initialRange,
  className,
}: PriceFilterProps) {
  const [minPrice, setMinPrice] = React.useState<string>(
    initialRange?.min !== undefined ? initialRange.min.toString() : ""
  );
  const [maxPrice, setMaxPrice] = React.useState<string>(
    initialRange?.max !== undefined ? initialRange.max.toString() : ""
  );

  // Aplicar el filtro de forma manual
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPrice === "" ? 0 : Number(minPrice);
    const max = maxPrice === "" ? 9999999 : Number(maxPrice);
    
    if (min <= max) {
      onPriceChange({ min, max });
    }
  };

  // Manejador para aplicar los rangos rápidos instantáneamente
  const handlePresetClick = (min: number, max: number) => {
    setMinPrice(min === 0 ? "" : min.toString());
    setMaxPrice(max === 9999999 ? "" : max.toString());
    onPriceChange({ min, max });
  };

  return (
    <div className={cn("w-full max-w-xs space-y-4 bg-white p-4 border border-border/40 rounded-card", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
        Filtrar por Precio
      </h3>

      {/* 1. BOTONES DE RANGOS PREESTABLECIDOS RAPIDOS */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_RANGES.map((preset) => {
          const isPresetActive = 
            (minPrice === "" && preset.min === 0 || minPrice === preset.min.toString()) &&
            (maxPrice === "" && preset.max === 9999999 || maxPrice === preset.max.toString());

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.min, preset.max)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-button border transition-all whitespace-nowrap",
                isPresetActive
                  ? "border-brand-dark bg-brand-dark text-white font-semibold"
                  : "border-border/50 text-brand-muted hover:text-brand-dark hover:bg-brand-light"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* 2. CAMPOS DE RANGO MANUALES */}
      <form onSubmit={handleApply} className="space-y-3 pt-2 border-t border-border/20">
        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="space-y-1">
            <label htmlFor="min-price" className="text-[10px] uppercase font-semibold text-brand-muted">Mínimo</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[11px] text-brand-muted/60 select-none">$</span>
              <input
                id="min-price"
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 w-full pl-6 pr-2 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="max-price" className="text-[10px] uppercase font-semibold text-brand-muted">Máximo</label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-[11px] text-brand-muted/60 select-none">$</span>
              <input
                id="max-price"
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-8 w-full pl-6 pr-2 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-8 bg-neutral-900 text-white rounded-button text-[11px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors focus:outline-none shadow-subtle"
        >
          Aplicar rango
        </button>
      </form>
    </div>
  );
}