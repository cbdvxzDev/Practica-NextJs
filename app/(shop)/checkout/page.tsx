"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "../../compents/ui/Button";
import { useCartStore } from "../../store/cart.store";

const formatMoney = (value: number) => `$${value.toLocaleString("es-CO")}`;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [step, setStep] = React.useState<"details" | "payment" | "success">("details");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal >= 150000 ? 0 : 12000;
  const total = subtotal + shipping;

  if (step === "success") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center space-y-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div>
        <h1 className="text-3xl font-medium">¡Pedido confirmado!</h1>
        <p className="text-sm leading-relaxed text-brand-muted">Gracias por comprar en NOVA. Te enviaremos la confirmación y el seguimiento a tu correo.</p>
        <Link href="/products"><Button>Seguir comprando</Button></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center space-y-4 text-center"><h1 className="text-2xl font-medium">Tu carrito está vacío</h1><Link href="/products"><Button>Volver al catálogo</Button></Link></div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (step === "details") {
      setStep("payment");
      return;
    }
    setIsProcessing(true);
    window.setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      setStep("success");
    }, 900);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="border-b border-border pb-6">
        <Link href="/cart" className="text-xs text-brand-muted underline underline-offset-4">← Volver al carrito</Link>
        <h1 className="mt-5 text-3xl font-medium tracking-tight">Finalizar compra</h1>
        <div className="mt-6 flex max-w-md items-center gap-3 text-xs font-semibold uppercase tracking-wider">
          <span className={step === "details" ? "text-brand-dark" : "text-brand-muted"}>1. Entrega</span><span className="h-px flex-1 bg-border" /><span className={step === "payment" ? "text-brand-dark" : "text-brand-muted"}>2. Pago</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === "details" ? (
            <>
              <section className="rounded-card border border-border/60 bg-white p-6">
                <h2 className="text-lg font-medium">Datos de entrega</h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium">Nombre completo<input required name="name" autoComplete="name" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                  <label className="text-xs font-medium">Teléfono<input required name="phone" type="tel" autoComplete="tel" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                  <label className="text-xs font-medium sm:col-span-2">Correo electrónico<input required name="email" type="email" autoComplete="email" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                  <label className="text-xs font-medium sm:col-span-2">Dirección<input required name="address" autoComplete="street-address" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                  <label className="text-xs font-medium">Ciudad<input required name="city" autoComplete="address-level2" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                  <label className="text-xs font-medium">Código postal<input required name="postalCode" inputMode="numeric" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                </div>
              </section>
              <section className="rounded-card border border-border/60 bg-white p-6">
                <h2 className="text-lg font-medium">Método de entrega</h2>
                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-button border border-brand-dark bg-brand-light p-4 text-sm"><input type="radio" name="shipping" defaultChecked /><span><strong>Entrega estándar</strong><span className="mt-1 block text-xs text-brand-muted">2 a 5 días hábiles · {shipping === 0 ? "Gratis" : formatMoney(shipping)}</span></span></label>
              </section>
            </>
          ) : (
            <section className="rounded-card border border-border/60 bg-white p-6">
              <h2 className="text-lg font-medium">Método de pago</h2>
              <p className="mt-2 text-sm text-brand-muted">Demo segura: no se realizará ningún cobro real.</p>
              <div className="mt-5 space-y-4">
                <label className="block text-xs font-medium">Número de tarjeta<input required inputMode="numeric" placeholder="4242 4242 4242 4242" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
                <div className="grid grid-cols-2 gap-4"><label className="text-xs font-medium">Vencimiento<input required placeholder="MM/AA" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label><label className="text-xs font-medium">CVV<input required inputMode="numeric" placeholder="123" className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label></div>
                <label className="block text-xs font-medium">Nombre en la tarjeta<input required className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm" /></label>
              </div>
            </section>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" isLoading={isProcessing} className="w-full sm:w-auto">{step === "details" ? "Continuar al pago" : "Confirmar pedido"}</Button>
        </form>
        <aside className="h-fit rounded-card border border-border/60 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-medium">Resumen</h2>
          <div className="mt-5 space-y-3 border-b border-border pb-5 text-sm">{items.map((item) => <div key={item.id} className="flex justify-between gap-4"><span className="text-brand-muted">{item.name} × {item.quantity}</span><span>{formatMoney(item.price * item.quantity)}</span></div>)}</div>
          <div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-brand-muted">Subtotal</span><span>{formatMoney(subtotal)}</span></div><div className="flex justify-between"><span className="text-brand-muted">Envío</span><span>{shipping === 0 ? "Gratis" : formatMoney(shipping)}</span></div><div className="flex justify-between border-t border-border pt-4 text-base font-semibold"><span>Total</span><span>{formatMoney(total)}</span></div></div>
        </aside>
      </div>
    </div>
  );
}
