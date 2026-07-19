"use client";

import * as React from "react";
import { cn } from "../..//lib/utils";
import { ProductPrice } from "./ProductPrice";
import { Button } from "../ui/Button";

export interface ProductInfoProps {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  onAddToCart?: (selectedSize: string, selectedColor: string) => void;
  className?: string;
}

export function ProductInfo({
  name,
  price,
  originalPrice,
  description,
  sizes = [],
  colors = [],
  onAddToCart,
  className,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = React.useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = React.useState(colors[0]?.name || "");
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = () => {
    if (!onAddToCart) return;
    setIsAdding(true);
    // Simular una micro-latencia de red premium antes de añadir al carrito
    setTimeout(() => {
      onAddToCart(selectedSize, selectedColor);
      setIsAdding(false);
    }, 600);
  };

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* 1. ENCABEZADO: TÍTULO Y PRECIO */}
      <div className="space-y-2 border-b border-border/30 pb-4">
        <h1 className="text-xl md:text-2xl font-medium tracking-tight text-brand-dark">
          {name}
        </h1>
        <ProductPrice price={price} originalPrice={originalPrice} size="xl" />
      </div>

      {/* 2. DESCRIPCIÓN EDITORIAL */}
      <div className="prose prose-sm max-w-none text-brand-muted leading-relaxed">
        <p>{description}</p>
      </div>

      {/* 3. SELECTOR DE COLORES (SUTILES BURBUJAS CROMÁTICAS) */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
            Color: <span className="text-brand-muted font-normal normal-case ml-1">{selectedColor}</span>
          </span>
          <div className="flex items-center space-x-3">
            {colors.map((color) => {
              const isColorActive = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-all focus:outline-none flex items-center justify-center",
                    isColorActive ? "border-brand-dark ring-1 ring-brand-dark" : "border-border/60"
                  )}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`Seleccionar color ${color.name}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SELECTOR DE TALLAS (GRILLA COMPACTA) */}
      {sizes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-brand-dark">Talla</span>
            <button className="text-brand-muted hover:text-brand-dark transition-colors underline underline-offset-4">
              Guía de tallas
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => {
              const isSizeActive = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-9 text-xs font-medium rounded-button border transition-all focus:outline-none",
                    isSizeActive
                      ? "border-brand-dark bg-brand-dark text-white font-semibold"
                      : "border-border/60 text-brand-dark hover:bg-brand-light"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BOTÓN DE ACCIÓN PRINCIPAL */}
      <div className="pt-4">
        <Button
          onClick={handleAdd}
          disabled={isAdding || (sizes.length > 0 && !selectedSize)}
          className="w-full h-11 text-xs font-semibold uppercase tracking-wider shadow-subtle"
        >
          {isAdding ? "Añadiendo..." : "Añadir a la bolsa"}
        </Button>
      </div>
    </div>
  );
}