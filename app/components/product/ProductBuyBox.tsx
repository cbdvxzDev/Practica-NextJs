"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart.store";
import { ProductActions } from "./ProductActions";
import { Button } from "../ui/Button";
import { SizeGuideModal } from "./SizeGuideModal";

export interface ProductBuyBoxProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  sizes?: string[];
}

export function ProductBuyBox({ id, slug, name, price, image, stock, sizes = [] }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [sizeError, setSizeError] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const requiresSize = sizes.length > 0;

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      setSizeError(true);
      return;
    }

    addItem({ id, slug, name, price, image, stock, size: selectedSize ?? undefined }, quantity);
    setSizeError(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      {requiresSize && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-dark">
              Talla
            </span>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[11px] text-brand-muted underline underline-offset-4 transition-colors hover:text-brand-dark"
            >
              Guía de tallas
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Seleccionar talla">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={[
                    "min-w-12 h-10 px-3 rounded-button border text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-brand-dark",
                    isSelected
                      ? "border-brand-dark bg-brand-dark text-white"
                      : "border-border/60 bg-white text-brand-muted hover:border-brand-dark hover:text-brand-dark",
                    sizeError && !isSelected ? "border-red-400" : "",
                  ].join(" ")}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {sizeError && (
            <p role="alert" className="text-[11px] text-red-600">
              Selecciona una talla para continuar.
            </p>
          )}
        </div>
      )}

      <ProductActions productId={id} slug={slug} stock={stock} initialQuantity={1} onQuantityChange={setQuantity} />

      <Button
        onClick={handleAddToCart}
        disabled={stock <= 0}
        className="w-full h-11 text-xs font-semibold uppercase tracking-wider shadow-subtle"
      >
        {stock <= 0 ? "Agotado" : justAdded ? "Añadido ✓" : "Añadir a la bolsa"}
      </Button>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
