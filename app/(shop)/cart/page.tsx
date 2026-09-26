"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "../../components/common/PageTitle";
import { CartItem } from "../../components/cart/CartItem";
import { CartSummary } from "../../components/cart/CartSummary";
import { Button } from "../../components/ui/Button";
import { useCartStore } from "../../store/cart.store";
import { CONFIG } from "@/constants/config";

export default function CartPage() {
  const isMounted = useIsMounted();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);


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
              key={item.lineId}
              id={item.lineId}
              slug={item.slug}
              name={item.name}
              price={item.price}
              image={item.image || CONFIG.images.placeholder}
              size={item.size}
              quantity={item.quantity}
              stock={item.stock ?? 99}
              onQuantityChange={(lineId, newQuantity) => updateQuantity(lineId, newQuantity)}
              onRemove={(lineId) => removeItem(lineId)}
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
