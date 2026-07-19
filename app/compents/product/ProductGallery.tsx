"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductGallery({ images, name, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  // Fallback elegante si el arreglo de imágenes llega vacío
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full rounded-card bg-neutral-100 border border-border/40 flex items-center justify-center">
        <svg className="h-8 w-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      
      {/* 1. VISUALIZADOR PRINCIPAL (HERO IMAGE) */}
      <div className="aspect-[3/4] w-full overflow-hidden rounded-card bg-neutral-50 border border-border/30 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex]}
          alt={`${name} - Vista principal`}
          className="h-full w-full object-cover object-center transition-all duration-500 ease-out animate-fadeIn"
          key={activeIndex} // Fuerza el relanzamiento de la animación de entrada al cambiar de imagen
        />
      </div>

      {/* 2. CARRUSEL DISCRETO DE MINIATURAS */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, index) => {
            const isSelected = index === activeIndex;
            return (
              <button
                key={img + index}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${name} - Miniatura ${index + 1}`}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}