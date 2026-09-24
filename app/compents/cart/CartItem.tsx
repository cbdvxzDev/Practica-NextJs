"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

export interface CartItemProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  stock: number;
  onQuantityChange?: (id: string, newQuantity: number) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function CartItem({
  id,
  slug,
  name,
  price,
  image,
  size,
  color,
  quantity,
  stock,
  onQuantityChange,
  onRemove,
  className,
}: CartItemProps) {
  const handleIncrement = () => {
    if (quantity < stock && onQuantityChange) {
      onQuantityChange(id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(id, quantity - 1);
    }
  };

  return (
    <div className={cn("flex items-start gap-4 py-5 px-5 bg-white border-b border-border/30 last:border-b-0", className)}>
      <div className="h-24 w-18 aspect-[3/4] flex-shrink-0 overflow-hidden rounded-card bg-neutral-100 border border-border/30">
        <img src={image} alt={name} className="h-full w-full object-cover object-center" loading="lazy" />
      </div>

      <div className="flex flex-1 flex-col justify-between self-stretch">
        <div className="space-y-1">
          <div className="flex justify-between gap-2">
            <h3 className="text-xs font-medium text-brand-dark tracking-tight line-clamp-1">
              <Link href={`/products/${slug}`} className="hover:opacity-80 transition-opacity">
                {name}
              </Link>
            </h3>
            <span className="text-xs font-semibold text-brand-dark flex-shrink-0">
              ${(price * quantity).toLocaleString("es-CO")}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-brand-muted">
            {size && <span>Talla: <span className="font-medium text-brand-dark uppercase">{size}</span></span>}
            {color && <span>Color: <span className="font-medium text-brand-dark">{color}</span></span>}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center h-8 border border-border/50 rounded-button bg-white overflow-hidden w-24">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-7 h-full flex items-center justify-center text-brand-muted hover:text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-30"
              aria-label="Disminuir cantidad"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="flex-1 text-center text-[11px] font-medium text-brand-dark select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= stock}
              className="w-7 h-full flex items-center justify-center text-brand-muted hover:text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-30"
              aria-label="Aumentar cantidad"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="text-[11px] font-medium text-neutral-400 hover:text-red-600 transition-colors underline underline-offset-4"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}