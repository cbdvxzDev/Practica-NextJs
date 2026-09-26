"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/constants/config";

export interface ProductGalleryProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductGallery({ images, name, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const gallery = images?.length ? images : [CONFIG.images.placeholder];

  // Si la lista de fotos cambia y el índice activo queda fuera de rango,
  // mostramos la primera en lugar de dejar un hueco vacío.
  const active = Math.min(activeIndex, gallery.length - 1);

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* 1. VISUALIZADOR PRINCIPAL (HERO IMAGE) */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-card bg-neutral-50 border border-border/30 relative">
        <Image
          key={gallery[active]}
          src={gallery[active]}
          alt={`${name} - Vista principal`}
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-center animate-fadeIn"
        />
      </div>

      {/* 2. CARRUSEL DISCRETO DE MINIATURAS */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((img, index) => {
            const isSelected = index === active;
            return (
              <button
                key={img + index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "aspect-[3/4] w-full overflow-hidden rounded-button bg-neutral-50 border transition-all focus:outline-none",
                  isSelected
                    ? "border-brand-dark ring-1 ring-brand-dark opacity-100"
                    : "border-border/40 opacity-60 hover:opacity-100"
                )}
                aria-label={`Ver imagen ${index + 1} de ${name}`}
                aria-current={isSelected ? "true" : "false"}
              >
                <Image
                  src={img}
                  alt={`${name} - Miniatura ${index + 1}`}
                  fill
                  sizes="15vw"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
