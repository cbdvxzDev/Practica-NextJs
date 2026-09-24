"use client";

import * as React from "react";
import Link from "next/link";
import { Receipt, Search } from "lucide-react";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/Button";
import { useOrderStore, Order, OrderStatus } from "@/store/order.store";

const getOrderStatusStyles = (status: string) => {
  switch (status) {
    case "delivered": return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "shipped": return { label: "Enviado", className: "bg-blue-50 text-blue-700 border border-blue-100" };
    case "processing": return { label: "En Proceso", className: "bg-brand-dark text-white" };
    case "pending": return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
    default: return { label: "Cancelado", className: "bg-red-50 text-red-700/80" };
  }
};

// Convierte el array de órdenes visibles a un archivo CSV real y lo descarga
function exportOrdersToCSV(orders: Order[]) {
  const headers = ["ID Orden", "Cliente", "Email", "Fecha", "Total", "Estado Pago", "Estado Envío"];
  const rows = orders.map((o) => [
    o.id,
    o.customer,
    o.email,
    o.date,
    o.total.toString(),
    o.paymentStatus,
    o.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  // BOM para que Excel reconozca acentos/UTF-8 correctamente
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ordenes-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "">("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "" || order.status === statusFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle title="Órdenes de Compra" description="Monitorea transacciones, controla estados de pago y gestiona la logística de envíos." />
        <Button variant="secondary" className="h-9 text-xs" onClick={() => exportOrdersToCSV(filteredOrders)}>
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-border/60 rounded-card p-4 shadow-subtle">
        <div className="flex flex-wrap items-center gap-3 text-sm flex-1">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-brand-muted text-xs">Filtrar por:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
              className="h-8 px-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">En proceso</option>
              <option value="shipped">Enviados</option>
              <option value="delivered">Entregados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-muted/60" aria-hidden="true" />
            <label htmlFor="order-search" className="sr-only">Buscar por ID o cliente</label>
            <input
              id="order-search"
              type="text"
              placeholder="Buscar por ID o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full pl-8 pr-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
          </div>
        </div>

        <div className="text-xs text-brand-muted whitespace-nowrap">
          Mostrando <span className="font-medium text-brand-dark">{filteredOrders.length}</span> de {orders.length} órdenes
        </div>
      </div>

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-brand-muted/60" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-brand-dark">No se encontraron órdenes</h3>
              <p className="text-xs text-brand-muted max-w-xs">
                {orders.length === 0
                  ? "Aún no se ha registrado ninguna orden en la plataforma."
                  : "Intenta ajustar el filtro o el término de búsqueda."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
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
                      <td className="py-4 px-6 font-medium text-brand-dark font-mono text-xs">{order.id}</td>
                      <td className="py-4 px-6 text-brand-dark">{order.customer}</td>
                      <td className="py-4 px-6 text-brand-muted text-xs">{order.date}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[11px] font-medium uppercase tracking-wider ${
                          order.paymentStatus === "paid" ? "text-neutral-900" : "text-brand-muted"
                        }`}>
                          {order.paymentStatus === "paid" ? "● Pagado" : "○ Pendiente"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-brand-dark">${order.total.toLocaleString("es-CO")}</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>{statusInfo.label}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" className="h-8 px-3 text-xs text-brand-dark hover:underline">Detalles →</Button>
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