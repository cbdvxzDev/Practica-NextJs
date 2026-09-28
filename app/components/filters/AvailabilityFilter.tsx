"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvailabilityFilterProps {
  inStockOnly: boolean;
  onSaleOnly: boolean;
  onChange: (next: { inStockOnly?: boolean; onSaleOnly?: boolean }) => void;
  className?: string;
}

interface OptionProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint?: string;
}

function Option({ checked, onChange, label, hint }: OptionProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group py-0.5">
      <span className="relative flex items-center h-4 mt-px">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "h-4 w-4 rounded-[4px] border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-brand-dark/30",
            checked
              ? "bg-brand-dark border-brand-dark"
              : "bg-white border-border/70 group-hover:border-brand-dark/50"
          )}
        />
        {checked && (
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="absolute left-0.5 top-0.5 h-3 w-3 text-white pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.2l2.3 2.3 4.7-4.9" />
          </svg>
        )}
      </span>
      <span className="text-xs text-brand-dark leading-tight">
        {label}
        {hint && <span className="block text-[10px] text-brand-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function AvailabilityFilter({
  inStockOnly,
  onSaleOnly,
  onChange,
  className,
}: AvailabilityFilterProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Option
        checked={inStockOnly}
        onChange={() => onChange({ inStockOnly: !inStockOnly })}
        label="Solo en stock"
        hint="Prendas disponibles para envío inmediato"
      />
      <Option
        checked={onSaleOnly}
        onChange={() => onChange({ onSaleOnly: !onSaleOnly })}
        label="Solo ofertas"
        hint="Piezas con precio de comparación"
      />
    </div>
  );
}
