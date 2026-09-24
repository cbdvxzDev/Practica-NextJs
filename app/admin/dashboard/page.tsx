"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { StatsCard } from "../../compents/admin/StatsCard";
import { Button } from "../../compents/ui/Button";
import { useProductStore } from "../../store/product.store";
import { useOrderStore } from "../../store/order.store";

export default function AdminDashboardPage() {
  const products = useProductStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);

  const stats = React.useMemo(() => {
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const activeOrdersCount = orders.filter((o) => o.status === "processing" || o.status === "pending").length;

    // Ingresos totales: solo órdenes efectivamente pagadas
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + o.total, 0);

    // Producto más vendido: agregamos cantidades por nombre en todas las órdenes
    const salesByProduct: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        salesByProduct[item.name] = (salesByProduct[item.name] ?? 0) + item.quantity;
      });
    });
    const topProductEntry = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1])[0];
    const topProductName = topProductEntry ? topProductEntry[0] : "Sin ventas aún";
    const topProductQty = topProductEntry ? topProductEntry[1] : 0;

    return [
      {
        id: "s1",
        title: "Ingresos Totales",
        value: `$${totalRevenue.toLocaleString("es-CO")}`,
        change: `${orders.filter((o) => o.paymentStatus === "paid").length} órdenes pagadas`,
        isPositive: true,
      },
      {
        id: "s2",
        title: "Órdenes Activas",
        value: String(activeOrdersCount),
        change: "En proceso o pendientes",
        isPositive: true,
      },
      {
        id: "s3",
        title: "Producto Más Vendido",
        value: topProductName,
        change: topProductEntry ? `${topProductQty} unidades vendidas` : "Aún no hay ventas",
        isPositive: true,
      },
      {
        id: "s4",
        title: "Agotados",
        value: String(outOfStockCount),
        change: outOfStockCount > 0 ? "Requiere atención" : "Todo en orden",
        isPositive: outOfStockCount === 0,
      },
    ];
  }, [products, orders]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle title="Panel de Control" description="Vista general del rendimiento comercial e inventario de la tienda." />
        <Button variant="secondary" className="h-9 text-xs">Exportar reporte</Button>
      </div>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.id} label={stat.title} amount={stat.value} percentage={stat.change} isGrowth={stat.isPositive} />
        ))}
      </section>

      {products.some((p) => p.stock > 0 && p.stock <= 5) && (
        <section className="bg-amber-50 border border-amber-200 rounded-card p-4 flex items-start gap-3">
          <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-800">Productos con inventario bajo</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {products.filter((p) => p.stock > 0 && p.stock <= 5).map((p) => p.title).join(", ")}
            </p>
          </div>
          <Link href="/admin/products" className="text-xs font-medium text-amber-800 hover:underline whitespace-nowrap">Ver productos →</Link>
        </section>
      )}

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-medium tracking-tight text-brand-dark">Últimas Órdenes Recibidas</h2>
            <p className="text-xs text-brand-muted">Monitoreo en tiempo real de transacciones.</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-medium text-brand-dark hover:underline underline-offset-4">Ver todas las órdenes →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
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
                  <td className="py-4 px-6 font-medium text-brand-dark">{order.id}</td>
                  <td className="py-4 px-6 text-brand-muted">{order.customer}</td>
                  <td className="py-4 px-6 text-brand-muted">{order.date}</td>
                  <td className="py-4 px-6 font-medium text-brand-dark">${order.total.toLocaleString("es-CO")}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === "delivered" ? "bg-neutral-100 text-neutral-800" : "bg-brand-dark text-white"
                    }`}>
                      {order.status === "delivered" ? "Entregado" : "En proceso"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}