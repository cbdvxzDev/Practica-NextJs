import { PageTitle } from "@/compents/common/PageTitle";
import { StatsCard } from "@/compents/admin/StatsCard";
import { Button } from "@/compents/ui/Button";
import Link from "next/link";

// Datos analíticos simulados
const MOCK_STATS = [
  { id: "stat-1", title: "Ingresos Totales", value: "$4.890.000", change: "+12.5%", isPositive: true },
  { id: "stat-2", title: "Órdenes Activas", value: "42", change: "+4.3%", isPositive: true },
  { id: "stat-3", title: "Productos en Catálogo", value: "128", change: "0%", isPositive: true },
  { id: "stat-4", title: "Bajo Inventario", value: "3", change: "-2 piezas", isPositive: false },
];

// Mock de órdenes recientes para la tabla del dashboard
const MOCK_RECENT_ORDERS = [
  { id: "ORD-2026-001", customer: "Carlos Mendoza", date: "Hoy, 11:24 AM", total: 189000, status: "processing" },
  { id: "ORD-2026-002", customer: "Sofía Restrepo", date: "Ayer, 4:15 PM", total: 45000, status: "delivered" },
  { id: "ORD-2026-003", customer: "Andrés Medina", date: "25 Jun, 2:30 PM", total: 234000, status: "delivered" },
];

export default async function AdminDashboardPage() {
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
        {MOCK_STATS.map((stat) => (
          <StatsCard
            key={stat.id}
            label={stat.title}
            amount={stat.value}
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
              {MOCK_RECENT_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/40 transition-colors">
                  <td className="py-4 px-6 font-medium text-brand-dark">{order.id}</td>
                  <td className="py-4 px-6 text-brand-muted">{order.customer}</td>
                  <td className="py-4 px-6 text-brand-muted">{order.date}</td>
                  <td className="py-4 px-6 font-medium text-brand-dark">
                    ${order.total.toLocaleString("es-CO")}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.status === "delivered" 
                        ? "bg-neutral-100 text-neutral-800" 
                        : "bg-brand-dark text-white"
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