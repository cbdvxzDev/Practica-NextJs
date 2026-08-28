import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";

// Estructura de datos mockeada para el control de órdenes (Alineado con order.service)
const MOCK_ADMIN_ORDERS = [
  {
    id: "ORD-2026-001",
    customer: "Carlos Mendoza",
    date: "27 Jun, 2026",
    total: 189000,
    status: "processing", // pending, processing, shipped, delivered, cancelled
    paymentStatus: "paid", // paid, pending, failed
  },
  {
    id: "ORD-2026-002",
    customer: "Sofía Restrepo",
    date: "26 Jun, 2026",
    total: 45000,
    status: "shipped",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2026-003",
    customer: "Andrés Medina",
    date: "25 Jun, 2026",
    total: 234000,
    status: "delivered",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2026-004",
    customer: "Mariana Velez",
    date: "24 Jun, 2026",
    total: 120000,
    status: "pending",
    paymentStatus: "pending",
  }
];

// Mapeo sobrio de estados logísticos para la UI
const getOrderStatusStyles = (status: string) => {
  switch (status) {
    case "delivered":
      return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "shipped":
      return { label: "Enviado", className: "bg-blue-50 text-blue-700 border border-blue-100" };
    case "processing":
      return { label: "En Proceso", className: "bg-brand-dark text-white" };
    case "pending":
      return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
    default:
      return { label: "Cancelado", className: "bg-red-50 text-red-700/80" };
  }
};

export default async function AdminOrdersPage() {
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
          <select className="h-8 px-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="processing">En proceso</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Entregados</option>
          </select>
        </div>
        <div className="text-xs text-brand-muted">
          Mostrando <span className="font-medium text-brand-dark">{MOCK_ADMIN_ORDERS.length}</span> órdenes recientes
        </div>
      </div>

      {/* TABLA DE ÓRDENES MAESTRA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
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
              {MOCK_ADMIN_ORDERS.map((order) => {
                const statusInfo = getOrderStatusStyles(order.status);
                return (
                  <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-medium text-brand-dark font-mono text-xs">
                      {order.id}
                    </td>
                    
                    {/* CLIENTE */}
                    <td className="py-4 px-6 text-brand-dark">
                      {order.customer}
                    </td>
                    
                    {/* FECHA */}
                    <td className="py-4 px-6 text-brand-muted text-xs">
                      {order.date}
                    </td>

                    {/* ESTADO DE PAGO */}
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-medium uppercase tracking-wider ${
                        order.paymentStatus === "paid" ? "text-neutral-900" : "text-brand-muted"
                      }`}>
                        {order.paymentStatus === "paid" ? "● Pagado" : "○ Pendiente"}
                      </span>
                    </td>
                    
                    {/* TOTAL */}
                    <td className="py-4 px-6 font-medium text-brand-dark">
                      ${order.total.toLocaleString("es-CO")}
                    </td>
                    
                    {/* ESTADO LOGÍSTICO */}
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
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
      </section>
    </div>
  );
}