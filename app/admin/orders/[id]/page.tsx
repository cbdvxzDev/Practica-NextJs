"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/Button";
import { useOrderStore } from "@/store/order.store";
import { Skeleton } from "@/components/ui/Skeleton";
import { CONFIG } from "@/constants/config";

const getOrderStatusStyles = (status: string) => {
  switch (status) {
    case "delivered": return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "shipped": return { label: "Enviado", className: "bg-blue-50 text-blue-700 border border-blue-100" };
    case "processing": return { label: "En Proceso", className: "bg-brand-dark text-white" };
    case "pending": return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
    default: return { label: "Cancelado", className: "bg-red-50 text-red-700/80" };
  }
};

export default function AdminOrderDetailPage() {
  const isMounted = useIsMounted();
  const params = useParams();
  const id = params.id as string;


  const order = useOrderStore((state) => state.orders.find((o) => o.id === id));
  const loading = useOrderStore((state) => state.loading);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  // 🔑 Esperamos a que el store termine de hidratar antes de decidir si es 404.
  // Un simple "montado" no basta: en el primer render las órdenes siguen vacías.
  if (!isMounted || loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const statusInfo = getOrderStatusStyles(order.status);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="border-b border-border pb-5 space-y-2">
        <Link href="/admin/orders" className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1">
          ← Volver al listado de órdenes
        </Link>
        <div className="flex items-center justify-between">
          <PageTitle title={`Orden ${order.id}`} description={`Realizada el ${order.date} por ${order.customer}`} />
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="bg-white border border-border/60 rounded-card p-5 shadow-subtle space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Cliente</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-brand-dark">{order.customer}</p>
            <p className="text-brand-muted text-xs">{order.email}</p>
          </div>
        </section>
        <section className="bg-white border border-border/60 rounded-card p-5 shadow-subtle space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Dirección de envío</h3>
          <p className="text-sm text-brand-dark">{order.shippingAddress}</p>
        </section>
        <section className="bg-white border border-border/60 rounded-card p-5 shadow-subtle space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Estado de pago</h3>
          <span className={`text-xs font-medium uppercase tracking-wider ${order.paymentStatus === "paid" ? "text-emerald-700" : "text-brand-muted"}`}>
            {order.paymentStatus === "paid" ? "● Pagado" : "○ Pendiente"}
          </span>
        </section>
      </div>

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-border/40">
          <h3 className="text-sm font-semibold text-brand-dark">Productos</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-border/40 text-brand-muted text-xs font-medium uppercase tracking-wider">
              <th className="py-3 px-5">Producto</th>
              <th className="py-3 px-5 text-center">Cantidad</th>
              <th className="py-3 px-5 text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 flex-shrink-0 rounded-card overflow-hidden relative bg-neutral-100 border border-border/30">
                      <Image
                        src={item.image || CONFIG.images.placeholder}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover object-center"
                        unoptimized={!item.image}
                      />
                    </div>
                    <div className="min-w-0">
                      {item.slug ? (
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-brand-dark hover:underline underline-offset-4 transition-opacity block truncate"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="text-brand-dark block truncate">{item.name}</span>
                      )}
                      {item.size && (
                        <span className="text-[11px] text-brand-muted uppercase">Talla: {item.size}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-5 text-center text-brand-muted">{item.quantity}</td>
                <td className="py-3 px-5 text-right font-medium text-brand-dark">${item.price.toLocaleString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/40">
              <td colSpan={2} className="py-3 px-5 text-right font-semibold text-brand-dark">Total</td>
              <td className="py-3 px-5 text-right font-semibold text-brand-dark">${order.total.toLocaleString("es-CO")}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => updateOrderStatus(order.id, "shipped")} disabled={order.status === "shipped" || order.status === "delivered"}>
          Marcar como enviado
        </Button>
        <Button variant="primary" onClick={() => updateOrderStatus(order.id, "delivered")} disabled={order.status === "delivered"}>
          Marcar como entregado
        </Button>
      </div>
    </div>
  );
}
