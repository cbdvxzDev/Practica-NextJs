"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useWishlistStore } from "@/store/wishlist.store";

export interface ProductActionsProps {
  productId: string;
  stock: number;
  onQuantityChange?: (quantity: number) => void;
  initialQuantity?: number;
  className?: string;
}

export function ProductActions({
  productId,
  stock,
  onQuantityChange,
  initialQuantity = 1,
  className,
}: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(initialQuantity);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isInWishlist(productId));

  const handleIncrement = () => {
    if (quantity < stock) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      onQuantityChange?.(newQty);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onQuantityChange?.(newQty);
    }
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    toggleWishlist(productId);
  };

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <div className="flex items-center h-10 border border-border/60 rounded-button bg-white overflow-hidden min-w-[110px]">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          className="w-9 h-full flex items-center justify-center text-brand-muted hover:text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-30"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        <span className="flex-1 text-center text-xs font-semibold text-brand-dark select-none">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantity >= stock}
          className="w-9 h-full flex items-center justify-center text-brand-muted hover:text-brand-dark hover:bg-brand-light transition-colors disabled:opacity-30"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={handleWishlistClick}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-button border transition-all focus:outline-none focus:ring-1 focus:ring-brand-dark",
          isWishlisted
            ? "border-red-100 bg-red-50 text-red-500"
            : "border-border/60 text-brand-muted hover:text-brand-dark hover:bg-brand-light"
        )}
        aria-label={isWishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        <svg
          className="h-4 w-4 transition-transform duration-200 active:scale-90"
          fill={isWishlisted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    </div>
  );
}