"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Envoltorio común de cada grupo del panel lateral. Centraliza el encabezado y
 * el separador para que Categoría / Talla / Precio / Disponibilidad se vean
 * iguales sin repetir el mismo `h3` y `hr` en cada componente.
 */
export function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
        {title}
      </h3>
      {children}
    </section>
  );
}
