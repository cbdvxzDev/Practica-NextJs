"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { Modal } from "../../compents/ui/Modal";
import { Input } from "../../compents/ui/Input";
import { useAuthStore } from "../../store/auth.store";
import { useOrderStore } from "../../store/order.store";

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

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const allOrders = useOrderStore((state) => state.orders);

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");

  React.useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const myOrders = allOrders.filter((o) => o.email.toLowerCase() === user?.email.toLowerCase());

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setIsSaving(true);
    try {
      await updateUser({ name, email });
      setIsEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Mi Cuenta"
          description="Gestiona tu información personal y revisa el historial de tus pedidos."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <section className="lg:col-span-4 space-y-6 bg-white border border-border/60 rounded-card p-6 shadow-subtle">
          <h2 className="text-lg font-medium tracking-tight border-b border-border/40 pb-3">
            Datos Personales
          </h2>

          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Nombre completo</span>
              <p className="font-medium text-brand-dark">{user?.name ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Correo electrónico</span>
              <p className="font-medium text-brand-dark">{user?.email ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-brand-muted block">Rol</span>
              <p className="text-brand-muted">{user?.role === "admin" ? "Administrador" : "Cliente"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <Button variant="secondary" className="w-full h-9 text-xs" onClick={() => setIsEditOpen(true)}>
              Editar información
            </Button>
          </div>
        </section>

        <section className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-medium tracking-tight">Historial de Órdenes</h2>

          {myOrders.length === 0 ? (
            <div className="border border-dashed border-border rounded-card p-8 text-center text-sm text-brand-muted">
              Aún no has realizado ninguna compra en nuestra plataforma.
            </div>
          ) : (
            <div className="bg-border/30 border border-border/60 rounded-card overflow-hidden space-y-px">
              {myOrders.map((order) => {
                const statusInfo = getStatusStyles(order.status);
                return (
                  <div key={order.id} className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors hover:bg-neutral-50/50">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-brand-dark">{order.id}</p>
                      <p className="text-xs text-brand-muted">Realizado el {order.date}</p>
                    </div>
                    <div className="sm:text-right space-y-0.5">
                      <p className="text-sm font-medium text-brand-dark">${order.total.toLocaleString("es-CO")}</p>
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
          )}
        </section>
      </div>

      {/* MODAL DE EDICIÓN — ahora sí funcional */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar información"
        description="Actualiza tu nombre y correo electrónico."
      >
<form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
      </Modal>
    </div>
  );
}