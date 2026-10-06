import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/services/order.service";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "delivered":
      return { label: "Entregado", className: "bg-neutral-100 text-neutral-800" };
    case "shipped":
      return { label: "Enviado", className: "bg-blue-50 text-blue-700" };
    case "processing":
      return { label: "En proceso", className: "bg-brand-dark text-white" };
    default:
      return { label: "Pendiente", className: "bg-neutral-50 text-brand-muted border border-border" };
  }
};

/**
 * Listado de pedidos de un cliente. Lo comparten el perfil y la ruta
 * `/profile/orders` para que no haya dos versiones del mismo markup.
 */
export function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-card p-8 text-center text-sm text-brand-muted">
        Aún no has realizado ninguna compra en nuestra plataforma.
      </div>
    );
  }

  return (
    <div className="bg-border/30 border border-border/60 rounded-card overflow-hidden space-y-px">
      {orders.map((order) => {
        const statusInfo = getStatusStyles(order.status);
        return (
          <div
            key={order.id}
            className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-neutral-50/50"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-brand-dark">{order.id}</p>
              <p className="text-xs text-brand-muted">Realizado el {order.date}</p>
            </div>
            <div className="sm:text-right space-y-0.5">
              <p className="text-sm font-medium text-brand-dark">
                ${order.total.toLocaleString("es-CO")}
              </p>
              <p className="text-xs text-brand-muted">
                {order.items.length} {order.items.length === 1 ? "artículo" : "artículos"}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0 border-border/40">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
              <Link href={`/profile/orders/${order.id}`}>
                <Button variant="ghost" className="h-8 px-3 text-xs text-brand-dark hover:underline">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
