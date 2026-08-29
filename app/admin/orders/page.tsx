"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";
import { useOrdersStore, type OrderStatus } from "@/store/orders.store";

// Mapeo sobrio de estados logísticos para la UI
const getOrderStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case "entregado":
      return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "enviado":
      return { label: "Enviado", className: "bg-blue-50 text-blue-700 border border-blue-100" };
    case "procesando":
      return { label: "En Proceso", className: "bg-brand-dark text-white" };
    case "pendiente":
      return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
    default:
      return { label: "Cancelado", className: "bg-red-50 text-red-700/80" };
  }
};

const STATUS_OPTIONS: OrderStatus[] = ["pendiente", "procesando", "enviado", "entregado", "cancelado"];

export default function AdminOrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const updateStatus = useOrdersStore((state) => state.updateStatus);
  const [filter, setFilter] = React.useState<OrderStatus | "">("");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const filteredOrders = React.useMemo(
    () => (filter ? orders.filter((order) => order.status === filter) : orders),
    [orders, filter]
  );

  return (
    <div className="space-y-8">
      {/* CABECERA DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Órdenes de Compra"
          description="Monitorea transacciones, controla estados de pago y gestiona la logística de envíos."
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs">
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* FILTROS Y ESTADOS RÁPIDOS */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-border/60 rounded-card p-4 shadow-subtle">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-brand-muted">Filtrar por:</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as OrderStatus | "")}
            className="h-8 px-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="procesando">En proceso</option>
            <option value="enviado">Enviados</option>
            <option value="entregado">Entregados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
        <div className="text-xs text-brand-muted">
          Mostrando <span className="font-medium text-brand-dark">{hydrated ? filteredOrders.length : 0}</span> órdenes recientes
        </div>
      </div>

      {/* TABLA DE ÓRDENES MAESTRA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {!hydrated || filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-brand-muted">
            {hydrated ? "No hay órdenes que coincidan con este filtro." : "Cargando…"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border/40 text-brand-muted text-xs font-medium uppercase tracking-wider">
                  <th className="py-3 px-6">ID Órden</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6">Fecha</th>
                  <th className="py-3 px-6">Pago</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6">Estado Envío</th>
                  <th className="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredOrders.map((order) => {
                  const statusInfo = getOrderStatusStyles(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                      {/* ID */}
                      <td className="py-4 px-6 font-medium text-brand-dark font-mono text-xs">
                        {order.id}
                      </td>

                      {/* CLIENTE */}
                      <td className="py-4 px-6 text-brand-dark">
                        {order.customerName}
                      </td>

                      {/* FECHA */}
                      <td className="py-4 px-6 text-brand-muted text-xs">
                        {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* ESTADO DE PAGO */}
                      <td className="py-4 px-6">
                        <span className={`text-[11px] font-medium uppercase tracking-wider ${
                          order.paymentStatus === "pagado" ? "text-neutral-900" : "text-brand-muted"
                        }`}>
                          {order.paymentStatus === "pagado" ? "● Pagado" : "○ Pendiente"}
                        </span>
                      </td>

                      {/* TOTAL */}
                      <td className="py-4 px-6 font-medium text-brand-dark">
                        ${order.total.toLocaleString("es-CO")}
                      </td>

                      {/* ESTADO LOGÍSTICO */}
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(event) => updateStatus(order.id, event.target.value as OrderStatus)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-brand-dark ${statusInfo.className}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {getOrderStatusStyles(status).label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACCIONES */}
                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="inline-flex">
                          <Button variant="ghost" className="h-8 px-3 text-xs text-brand-dark hover:underline">
                            Detalles →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
