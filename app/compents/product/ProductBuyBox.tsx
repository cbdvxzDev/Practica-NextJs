"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart.store";
import { useEffectiveStock } from "@/store/inventory.store";
import { ProductActions } from "./ProductActions";
import { Button } from "../ui/Button";

export interface ProductBuyBoxProps {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export function ProductBuyBox({ id, slug, name, price, image, stock: baseStock }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const effectiveStock = useEffectiveStock(id);

  const isMounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  // Antes de la hidratación del store persistido usamos el stock base para evitar parpadeos.
  const stock = isMounted ? effectiveStock : baseStock;

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    const normalizedQuantity = Math.max(1, Math.min(Number(quantity) || 1, stock));

    addItem({ id, slug, name, price, image, stock }, normalizedQuantity);
    setJustAdded(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <ProductActions stock={stock} initialQuantity={1} onQuantityChange={setQuantity} />

      {stock > 0 && stock <= 5 && (
        <p className="text-xs font-medium text-amber-600">¡Solo quedan {stock} unidades!</p>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={stock <= 0}
        className="w-full h-11 text-xs font-semibold uppercase tracking-wider shadow-subtle"
      >
        {stock <= 0 ? "Agotado" : justAdded ? "Añadido ✓" : "Añadir a la bolsa"}
      </Button>
    </div>
  );
}