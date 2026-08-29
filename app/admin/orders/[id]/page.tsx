"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageTitle } from "@/compents/common/PageTitle";
import { useOrdersStore, type OrderStatus } from "@/store/orders.store";

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
const STATUS_OPTIONS: OrderStatus[] = ["pendiente", "procesando", "enviado", "entregado", "cancelado"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orders = useOrdersStore((state) => state.orders);
  const updateStatus = useOrdersStore((state) => state.updateStatus);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const order = orders.find((item) => item.id === params.id);
  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === "cancelado";

  if (!hydrated) {
    return <div className="py-24 text-center text-sm text-brand-muted">Cargando…</div>;
  }

  if (!order) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center py-16">
        <PageTitle title="Orden no encontrada" description="No existe ninguna orden con ese identificador." />
        <Link href="/admin/orders" className="text-xs font-medium text-brand-dark underline underline-offset-4">
          ← Volver a órdenes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* NAVEGACIÓN DE RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link
          href="/admin/orders"
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver a órdenes
        </Link>
        <PageTitle
          title={`Orden ${order.id}`}
          description={`Realizada el ${new Date(order.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}`}
        />
      </div>

      <section className="space-y-6 rounded-card border border-border/60 bg-white p-6">
        <div className="flex flex-col gap-3 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <span className={`w-fit text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles(order.status).className}`}>
            {getStatusStyles(order.status).label}
          </span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-brand-muted">Cambiar estado:</span>
            <select
              value={order.status}
              onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
              className="h-8 px-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{getStatusStyles(status).label}</option>
              ))}
            </select>
          </div>
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
            <span className="block text-xs text-brand-muted">Cliente</span>
            <p className="font-medium text-brand-dark">{order.customerName}</p>
            <p className="text-brand-muted">{order.customerEmail}</p>
            <p className="text-brand-muted">{order.phone}</p>
          </div>
          <div className="space-y-1 text-sm">
            <span className="block text-xs text-brand-muted">Dirección de envío</span>
            <p className="text-brand-dark">{order.address}</p>
            <p className="text-brand-muted">{order.city}, {order.postalCode}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border/40 pt-6">
          <h3 className="text-sm font-medium text-brand-dark">Productos</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-muted">{item.name} × {item.quantity}</span>
              <span className="font-medium text-brand-dark">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 border-t border-border/40 pt-6 text-sm">
          <div className="flex justify-between text-brand-muted">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between text-brand-muted">
            <span>Envío</span>
            <span>${order.shipping.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between text-base font-medium text-brand-dark pt-1">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-CO")}</span>
          </div>
          <p className="text-xs text-brand-muted pt-1">
            Pago: {order.paymentStatus === "pagado" ? "Confirmado" : "Pendiente"}
          </p>
        </div>
      </section>
    </div>
  );
}
