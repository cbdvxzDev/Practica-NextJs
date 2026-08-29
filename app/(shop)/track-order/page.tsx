"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { useOrdersStore, type OrderStatus, type Order } from "../../store/orders.store";

// Estilos visuales por estado, reutilizados también en /profile.
const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case "entregado":
      return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "enviado":
      return { label: "Enviado", className: "bg-blue-100 text-blue-800" };
    case "procesando":
      return { label: "En proceso", className: "bg-brand-dark text-white" };
    case "cancelado":
      return { label: "Cancelado", className: "bg-red-100 text-red-700" };
    default:
      return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
  }
};

const STATUS_STEPS: OrderStatus[] = ["pendiente", "procesando", "enviado", "entregado"];

export default function TrackOrderPage() {
  const getOrderByIdAndEmail = useOrdersStore((state) => state.getOrderByIdAndEmail);

  const [orderId, setOrderId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<Order | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setHasSearched(true);

    if (!orderId.trim() || !email.trim()) {
      setError("Ingresa el número de pedido y el correo con el que compraste.");
      setResult(null);
      return;
    }

    const found = getOrderByIdAndEmail(orderId, email);
    if (!found) {
      setError("No encontramos un pedido con esos datos. Revisa el número de orden y el correo.");
      setResult(null);
      return;
    }

    setResult(found);
  };

  const currentStepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const isCancelled = result?.status === "cancelado";

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Rastrear mi pedido"
        subtitle="Consulta el estado de tu compra sin necesidad de iniciar sesión. Solo necesitas tu número de pedido y el correo con el que compraste."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-card border border-border/60 bg-white p-6 sm:grid-cols-2">
        <label className="text-xs font-medium">
          Número de pedido
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="ORD-2026-0001"
            className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
          />
        </label>
        <label className="text-xs font-medium">
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" className="h-11 w-full sm:w-auto sm:px-8">
            Buscar pedido
          </Button>
        </div>
      </form>

      {error && (
        <div className="rounded-card border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasSearched && result && (
        <section className="space-y-6 rounded-card border border-border/60 bg-white p-6">
          <div className="flex flex-col gap-2 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-medium text-brand-dark">{result.id}</p>
              <p className="text-xs text-brand-muted">
                Realizado el {new Date(result.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <span className={`w-fit text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles(result.status).className}`}>
              {getStatusStyles(result.status).label}
            </span>
          </div>

          {/* Barra de progreso del pedido */}
          {!isCancelled && (
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        index <= currentStepIndex ? "bg-brand-dark text-white" : "bg-neutral-100 text-brand-muted"
                      }`}
                    >
                      {index < currentStepIndex ? "✓" : index + 1}
                    </div>
                    <span className="text-[11px] capitalize text-brand-muted">{getStatusStyles(step).label}</span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <span className={`mx-2 h-px flex-1 ${index < currentStepIndex ? "bg-brand-dark" : "bg-border"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 border-t border-border/40 pt-6 sm:grid-cols-2">
            <div className="space-y-1 text-sm">
              <span className="block text-xs text-brand-muted">Enviado a</span>
              <p className="font-medium text-brand-dark">{result.customerName}</p>
              <p className="text-brand-muted">{result.address}, {result.city}</p>
              <p className="text-brand-muted">{result.phone}</p>
            </div>
            <div className="space-y-1 text-sm sm:text-right">
              <span className="block text-xs text-brand-muted">Total del pedido</span>
              <p className="text-lg font-medium text-brand-dark">${result.total.toLocaleString("es-CO")}</p>
              <p className="text-xs text-brand-muted">Pago: {result.paymentStatus === "pagado" ? "Confirmado" : "Pendiente"}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-border/40 pt-6">
            <h3 className="text-sm font-medium text-brand-dark">Productos</h3>
            {result.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-brand-muted">{item.name} × {item.quantity}</span>
                <span className="font-medium text-brand-dark">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-brand-muted">
        ¿Ya tienes cuenta? <Link href="/login" className="underline underline-offset-4 hover:text-brand-dark">Inicia sesión</Link> para ver todo tu historial de pedidos en un solo lugar.
      </p>
    </div>
  );
}
