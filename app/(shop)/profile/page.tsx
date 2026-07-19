import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { Badge } from "../../compents/ui/Badge";

// Datos mockeados del usuario y sus órdenes (Alineado con tu data/users.json y order.service)
const MOCK_USER = {
  name: "Alejandro Pérez",
  email: "alejandro@example.com",
  joinedAt: "12 de Marzo, 2025",
};

const MOCK_ORDERS = [
  {
    id: "ORD-2026-001",
    date: "24 Jun, 2026",
    total: 234000,
    status: "delivered", // delivered, pending, processing, cancelled
    itemsCount: 3,
  },
  {
    id: "ORD-2026-002",
    date: "10 May, 2026",
    total: 45000,
    status: "processing",
    itemsCount: 1,
  },
];

// Función auxiliar para formatear los estados de las órdenes de manera sobria
const getStatusStyles = (status: string) => {
  switch (status) {
    case "delivered":
      return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "processing":
      return { label: "En proceso", className: "bg-brand-dark text-white" };
    default:
      return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
  }
};

export default async function ProfilePage() {
  return (
    <div className="space-y-12">
      {/* Encabezado Principal */}
      <div className="border-b border-border pb-5">
        <PageTitle 
          title="Mi Cuenta" 
          subtitle="Gestiona tu información personal y revisa el historial de tus pedidos." 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* COLUMNA 1: INFORMACIÓN DEL PERFIL (Ocupa 4 de 12 columnas) */}
        <section className="lg:col-span-4 space-y-6 bg-white border border-border/60 rounded-card p-6 shadow-subtle">
          <h2 className="text-lg font-medium tracking-tight border-b border-border/40 pb-3">
            Datos Personales
          </h2>
          
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Nombre completo</span>
              <p className="font-medium text-brand-dark">{MOCK_USER.name}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Correo electrónico</span>
              <p className="font-medium text-brand-dark">{MOCK_USER.email}</p>
            </div>

            <div className="space-y-1/2">
              <span className="text-xs text-brand-muted block">Miembro desde</span>
              <p className="text-brand-muted">{MOCK_USER.joinedAt}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <Button variant="secondary" className="w-full h-9 text-xs">
              Editar información
            </Button>
          </div>
        </section>

        {/* COLUMNA 2: HISTORIAL DE PEDIDOS (Ocupa 8 de 12 columnas) */}
        <section className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-medium tracking-tight">
            Historial de Órdenes
          </h2>

          {MOCK_ORDERS.length === 0 ? (
            <div className="border border-dashed border-border rounded-card p-8 text-center text-sm text-brand-muted">
              Aún no has realizado ninguna compra en nuestra plataforma.
            </div>
          ) : (
            <div className="bg-border/30 border border-border/60 rounded-card overflow-hidden space-y-px">
              {MOCK_ORDERS.map((order) => {
                const statusInfo = getStatusStyles(order.status);
                return (
                  <div 
                    key={order.id} 
                    className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-neutral-50/50"
                  >
                    {/* ID y Fecha */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand-dark">{order.id}</p>
                      <p className="text-xs text-brand-muted">Realizado el {order.date}</p>
                    </div>

                    {/* Cantidad y Total */}
                    <div className="sm:text-right space-y-0.5">
                      <p className="text-sm font-medium text-brand-dark">
                        ${order.total.toLocaleString("es-CO")}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {order.itemsCount} {order.itemsCount === 1 ? "artículo" : "artículos"}
                      </p>
                    </div>

                    {/* Estado y Acción */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0 border-border/40">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      <Button variant="ghost" className="h-8 px-3 text-xs text-brand-dark hover:underline">
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}