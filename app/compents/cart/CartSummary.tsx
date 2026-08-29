"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

export interface CartSummaryProps {
  subtotal: number;
  shippingCost?: number;
  freeShippingThreshold?: number;
  onCheckout?: () => void;
  className?: string;
}

export function CartSummary({
  subtotal,
  shippingCost = 12000,
  freeShippingThreshold = 200000, // Envío gratis a partir de $200.000 COP
  onCheckout,
  className,
}: CartSummaryProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Determinar si aplica envío gratuito
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const activeShippingCost = isFreeShipping ? 0 : shippingCost;
  const total = subtotal + activeShippingCost;

  // Cálculo para la barra de progreso de envío gratis
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    if (!onCheckout) return;
    setIsProcessing(true);
    // Simulación de latencia de red premium para la transición a la pasarela
    setTimeout(() => {
      onCheckout();
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div 
      className={cn(
        "rounded-card border border-border/40 bg-neutral-50/50 p-6 space-y-6",
        className
      )}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
        Resumen del pedido
      </h2>

      {/* INDICADOR MINIMALISTA DE ENVÍO GRATIS */}
      {subtotal > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-brand-muted leading-relaxed">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-medium">¡Tu pedido califica para envío gratuito! ✨</span>
            ) : (
              <>
                Estás a <span className="font-semibold text-brand-dark">${amountNeededForFreeShipping.toLocaleString("es-CO")}</span> de obtener envío gratis.
              </>
            )}
          </p>
          <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isFreeShipping ? "bg-emerald-600" : "bg-brand-dark"
              )}
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>
      )}

      {/* DESGLOSE DE COSTOS */}
      <div className="space-y-3 text-xs border-b border-border/30 pb-4">
        <div className="flex justify-between text-brand-muted">
          <span>Subtotal</span>
          <span className="font-medium text-brand-dark">${subtotal.toLocaleString("es-CO")}</span>
        </div>
        
        <div className="flex justify-between text-brand-muted">
          <span>Envío estimado</span>
          <span className="font-medium text-brand-dark">
            {isFreeShipping ? (
              <span className="text-emerald-700 uppercase font-semibold text-[10px] tracking-wider">Gratis</span>
            ) : (
              `$${shippingCost.toLocaleString("es-CO")}`
            )}
          </span>
        </div>
      </div>

      {/* TOTAL DEFINTIVO */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-brand-dark uppercase tracking-wider">Total</span>
        <span className="text-lg font-bold text-brand-dark tracking-tight">
          ${total.toLocaleString("es-CO")}
        </span>
      </div>

      {/* BOTÓN DE CHECKOUT */}
      <div className="pt-2">
        <Button
          onClick={handleCheckout}
          disabled={isProcessing || subtotal === 0}
          className="w-full h-11 text-xs font-semibold uppercase tracking-wider"
        >
          {isProcessing ? "Procesando..." : "Proceder al pago"}
        </Button>
      </div>

      <p className="text-[10px] text-center text-brand-muted leading-relaxed">
        Impuestos incluidos. Descuentos o códigos promocionales se aplican en el siguiente paso.
      </p>
    </div>
  );
}