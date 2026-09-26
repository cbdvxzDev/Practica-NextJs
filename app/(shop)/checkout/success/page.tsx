"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/Button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fadeIn">
      <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">¡Pedido confirmado!</h1>
        <p className="text-sm text-brand-muted max-w-sm mx-auto">
          {orderId ? (
            <>Tu orden <span className="font-semibold text-brand-dark">{orderId}</span> ha sido registrada exitosamente.</>
          ) : (
            "Tu pedido ha sido registrado exitosamente."
          )}
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/profile"><Button variant="primary">Ver mis pedidos</Button></Link>
        <Link href="/products"><Button variant="outline">Seguir comprando</Button></Link>
      </div>
    </div>
  );
}