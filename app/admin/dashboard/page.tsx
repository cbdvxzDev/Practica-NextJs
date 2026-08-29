"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { StatsCard } from "@/compents/admin/StatsCard";
import { Button } from "@/compents/ui/Button";
import { useOrdersStore } from "@/store/orders.store";
import { useCatalogStore } from "@/store/catalog.store";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboardPage() {
  const orders = useOrdersStore((state) => state.orders);
  const products = useCatalogStore((state) => state.products);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter((order) => order.status !== "entregado" && order.status !== "cancelado").length;
  const lowStockCount = products.filter((product) => product.stock <= LOW_STOCK_THRESHOLD).length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    { id: "stat-1", title: "Ingresos Totales", value: `$${totalRevenue.toLocaleString("es-CO")}`, change: `${orders.length} órdenes`, isPositive: true },
    { id: "stat-2", title: "Órdenes Activas", value: String(activeOrders), change: `${orders.length} en total`, isPositive: true },
    { id: "stat-3", title: "Productos en Catálogo", value: String(products.length), change: "En vivo", isPositive: true },
    { id: "stat-4", title: "Bajo Inventario", value: String(lowStockCount), change: `≤ ${LOW_STOCK_THRESHOLD} unidades`, isPositive: lowStockCount === 0 },
  ];

  return (
    <div className="space-y-10">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle 
          title="Panel de Control" 
          description="Vista general del rendimiento comercial e inventario de la tienda." 
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs">
            Exportar reporte
          </Button>
        </div>
      </div>

      {/* 1. SECCIÓN DE TARJETAS ANALÍTICAS (Grid Uniforme) */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.id}
            label={stat.title}
            amount={hydrated ? stat.value : "—"}
            percentage={stat.change}
            isGrowth={stat.isPositive}
          />
        ))}
      </section>

      {/* 2. BLOQUE DE ACTIVIDAD RECIENTE (Layout Limpio) */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-medium tracking-tight text-brand-dark">
              Últimas Órdenes Recibidas
            </h2>
            <p className="text-xs text-brand-muted">Monitoreo en tiempo real de transacciones.</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-medium text-brand-dark hover:underline underline-offset-4">
            Ver todas las órdenes →
          </Link>
        </div>

        {/* Tabla Minimalista */}
        {!hydrated || recentOrders.length === 0 ? (
          <div className="p-10 text-center text-sm text-brand-muted">
            {hydrated ? "Aún no se han registrado órdenes." : "Cargando…"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border/40 text-brand-muted text-xs font-medium uppercase tracking-wider">
                  <th className="py-3 px-6">ID Órden</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6">Fecha</th>
                  <th className="py-3 px-6">Total</th>
                  <th className="py-3 px-6 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-brand-dark">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.id}</Link>
                    </td>
                    <td className="py-4 px-6 text-brand-muted">{order.customerName}</td>
                    <td className="py-4 px-6 text-brand-muted">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-4 px-6 font-medium text-brand-dark">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                        order.status === "entregado" 
                          ? "bg-neutral-100 text-neutral-800" 
                          : order.status === "cancelado"
                          ? "bg-red-100 text-red-700"
                          : "bg-brand-dark text-white"
                      }`}>
                        {order.status === "entregado" ? "Entregado" : order.status === "cancelado" ? "Cancelado" : "En proceso"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}