"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { Input } from "../../compents/ui/Input";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../store/auth.store";
import { useOrderStore } from "../../store/order.store";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const createOrder = useOrderStore((state) => state.createOrder);

  const [address, setAddress] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => setIsMounted(true), []);

  if (isMounted && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-2xl font-medium">Inicia sesión para continuar</h1>
        <p className="text-sm text-brand-muted max-w-sm">
          Necesitas una cuenta para completar tu compra.
        </p>
        <Button variant="primary" onClick={() => router.push("/login")}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  if (isMounted && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-2xl font-medium">Tu carrito está vacío</h1>
        <Button variant="primary" onClick={() => router.push("/products")}>
          Ir al catálogo
        </Button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 200000 ? 0 : 12000;
  const total = subtotal + shippingCost;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !address.trim()) return;

    setIsProcessing(true);
    setError("");

    try {
      // La mini API valida stock, calcula el total y descuenta inventario.
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: address.trim(),
      });

      clearCart();
      router.push(`/checkout/success?order=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar el pedido.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Finalizar Compra"
          description="Confirma tu dirección de envío y completa tu pedido."
        />
      </div>

      <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-border/60 rounded-card p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
              Dirección de envío
            </h3>
            <Input
              label="Dirección completa"
              placeholder="Calle, número, ciudad, departamento"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="bg-white border border-border/60 rounded-card p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
              Productos
            </h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-brand-muted">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium text-brand-dark">
                  ${(item.price * item.quantity).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-neutral-50/50 border border-border/40 rounded-card p-6 space-y-4 sticky top-24">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
              Resumen
            </h3>
            <div className="space-y-2 text-xs border-b border-border/30 pb-4">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-medium text-brand-dark">${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Envío</span>
                <span className="font-medium text-brand-dark">
                  {shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString("es-CO")}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold uppercase text-brand-dark">Total</span>
              <span className="text-lg font-bold text-brand-dark">${total.toLocaleString("es-CO")}</span>
            </div>
            <Button type="submit" disabled={isProcessing} className="w-full h-11 text-xs font-semibold uppercase tracking-wider">
              {isProcessing ? "Procesando pago..." : "Confirmar pedido"}
            </Button>
            {error && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}