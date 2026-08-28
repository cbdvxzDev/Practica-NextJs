"use client";

import * as React from "react";
import { useCartStore } from "@/store/cart.store";
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

export function ProductBuyBox({ id, slug, name, price, image, stock }: ProductBuyBoxProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id, slug, name, price, image, stock }, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="space-y-4">
      <ProductActions stock={stock} initialQuantity={1} onQuantityChange={setQuantity} />

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