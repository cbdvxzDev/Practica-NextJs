"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "../../compents/common/PageTitle";
import { CartItem } from "../../compents/cart/CartItem";
import { CartSummary } from "../../compents/cart/CartSummary";
import { Button } from "../../compents/ui/Button";
import { useCartStore } from "../../store/cart.store";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  const isCartEmpty = items.length === 0;

  if (isCartEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-2xl font-medium">Tu carrito está vacío</h1>
        <Link href="/products">
          <Button variant="primary">Continuar comprando</Button>
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Tu Carrito"
          description={`Tienes ${items.length} artículo${items.length === 1 ? "" : "s"} en tu bolsa de compra.`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10 items-start">
        <section className="lg:col-span-8 space-y-px bg-border/40 rounded-card overflow-hidden border border-border/60">
          {items.map((item) => (
            <CartItem
              key={item.id}
              id={item.id}
              slug={item.slug}
              name={item.name}
              price={item.price}
              image={item.image || "https://placehold.co/300x400/e8e4df/6B7280?text=Producto"}
              quantity={item.quantity}
              stock={item.stock ?? 99}
              onQuantityChange={(id, newQuantity) => updateQuantity(id, newQuantity)}
              onRemove={(id) => removeItem(id)}
            />
          ))}
        </section>

        <section className="lg:col-span-4 sticky top-24">
          <CartSummary
            subtotal={subtotal}
            onCheckout={() => router.push("/checkout")}
          />
        </section>
      </div>
    </div>
  );
}