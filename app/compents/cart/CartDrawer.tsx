"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CartItem, CartItemProps } from "./CartItem";
import { CartSummary } from "./CartSummary";

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemProps[];
  shippingCost?: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  shippingCost = 12000,
  onQuantityChange,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  // Escuchar la tecla 'Escape' para cerrar el panel automáticamente
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Calcular el subtotal sumando cada elemento de la bolsa
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 pointer-events-none transition-all duration-300",
        isOpen && "pointer-events-auto"
      )}
    >
      {/* 1. FONDO TRASLÚCIDO (OVERLAY) */}
      <div
        className={cn(
          "absolute inset-0 bg-brand-dark/20 backdrop-blur-sm opacity-0 transition-opacity duration-300 ease-out",
          isOpen && "opacity-100"
        )}
        onClick={onClose}
      />

      {/* 2. PANEL DESLIZABLE */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl border-l border-border/40 flex flex-col translate-x-full transition-transform duration-300 ease-out",
          isOpen && "translate-x-0"
        )}
      >
        {/* ENCABEZADO DISCRETO */}
        <div className="h-16 px-6 border-b border-border/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark flex items-center gap-2">
            Bolsa de compra 
            <span className="text-xs font-mono lowercase bg-brand-light px-2 py-0.5 rounded text-brand-muted">
              {items.length} {items.length === 1 ? "artículo" : "artículos"}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-dark transition-colors focus:outline-none"
            aria-label="Cerrar bolsa de compra"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENIDO INTERMEDIO CON SCROLL INDEPENDIENTE */}
        <div className="flex-1 overflow-y-auto px-6 divide-y divide-border/30">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
              <svg className="h-8 w-8 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-xs text-brand-muted">Tu bolsa de compra está vacía.</p>
              <button 
                onClick={onClose} 
                className="text-xs font-semibold text-brand-dark underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Continuar explorando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                {...item}
                onQuantityChange={onQuantityChange}
                onRemove={onRemoveItem}
              />
            ))
          )}
        </div>

        {/* PIE DE PÁGINA FIJO CON EL RESUMEN */}
        {items.length > 0 && (
          <div className="border-t border-border/30 p-6 bg-neutral-50/30">
            <CartSummary
              subtotal={subtotal}
              shippingCost={shippingCost}
              onCheckout={onCheckout}
              className="border-0 p-0 bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}