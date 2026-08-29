"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { useAuthStore } from "../../store/auth.store";
import { useOrdersStore, type OrderStatus } from "../../store/orders.store";

// Función auxiliar para formatear los estados de las órdenes de manera sobria
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

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const getOrdersByEmail = useOrdersStore((state) => state.getOrdersByEmail);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  React.useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !user) {
    return <div className="py-24 text-center text-sm text-brand-muted">Cargando…</div>;
  }

  const orders = getOrdersByEmail(user.email);

  return (
    <div className="space-y-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle
          title="Mi Cuenta"
          subtitle="Gestiona tu información personal y revisa el historial de tus pedidos."
        />
        <Button variant="secondary" className="h-9 text-xs" onClick={() => { logout(); router.push("/login"); }}>
          Cerrar sesión
        </Button>
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
              <p className="font-medium text-brand-dark">{user.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Correo electrónico</span>
              <p className="font-medium text-brand-dark">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Rol de cuenta</span>
              <p className="text-brand-muted capitalize">{user.role === "admin" ? "Administrador" : "Cliente"}</p>
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

          {orders.length === 0 ? (
            <div className="border border-dashed border-border rounded-card p-8 text-center text-sm text-brand-muted">
              Aún no has realizado ninguna compra en nuestra plataforma.
              <div className="mt-4">
                <Link href="/products"><Button className="h-9 text-xs">Ir a comprar</Button></Link>
              </div>
            </div>
          ) : (
            <div className="bg-border/30 border border-border/60 rounded-card overflow-hidden space-y-px">
              {orders.map((order) => {
                const statusInfo = getStatusStyles(order.status);
                const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <div
                    key={order.id}
                    className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-neutral-50/50"
                  >
                    {/* ID y Fecha */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand-dark">{order.id}</p>
                      <p className="text-xs text-brand-muted">
                        Realizado el {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    {/* Cantidad y Total */}
                    <div className="sm:text-right space-y-0.5">
                      <p className="text-sm font-medium text-brand-dark">
                        ${order.total.toLocaleString("es-CO")}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {itemsCount} {itemsCount === 1 ? "artículo" : "artículos"}
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