"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";
import { Modal } from "../../compents/ui/Modal";
import { useAuthStore } from "../../store/auth.store";
import { useOrdersStore, type OrderStatus, type Order } from "../../store/orders.store";
import { AuthService } from "../../services/auth.service";

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

const STATUS_STEPS: OrderStatus[] = ["pendiente", "procesando", "enviado", "entregado"];

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const setAuth = useAuthStore((state) => state.setAuth);
  const getOrdersByEmail = useOrdersStore((state) => state.getOrdersByEmail);
  const [hydrated, setHydrated] = React.useState(false);

  // Estado del modal de edición de datos personales
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editError, setEditError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState("");

  // Estado del modal de detalles del pedido
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

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

  const openEditModal = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditError("");
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError("");

    if (!editName.trim() || !editEmail.trim()) {
      setEditError("Completa tu nombre y correo electrónico.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await AuthService.updateUser(user.id, { name: editName, email: editEmail });
      setAuth(updatedUser);
      setIsEditOpen(false);
      setSavedMessage("Tus datos se actualizaron correctamente.");
      setTimeout(() => setSavedMessage(""), 4000);
    } catch (reason) {
      setEditError(reason instanceof Error ? reason.message : "No pudimos guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepIndex = selectedOrder ? STATUS_STEPS.indexOf(selectedOrder.status) : -1;
  const isSelectedCancelled = selectedOrder?.status === "cancelado";

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

      {savedMessage && (
        <div className="rounded-card border border-green-200 bg-green-50 px-6 py-3 text-sm text-green-700">
          {savedMessage}
        </div>
      )}

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
            <Button variant="secondary" className="w-full h-9 text-xs" onClick={openEditModal}>
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
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-brand-dark hover:underline"
                        onClick={() => setSelectedOrder(order)}
                      >
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

      {/* MODAL: Editar información personal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar información personal"
        description="Actualiza tu nombre o correo electrónico."
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <label className="block text-xs font-medium text-brand-dark">
            Nombre completo
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
          </label>
          <label className="block text-xs font-medium text-brand-dark">
            Correo electrónico
            <input
              type="email"
              value={editEmail}
              onChange={(event) => setEditEmail(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
          </label>
          {editError && <p role="alert" className="text-xs font-medium text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" className="h-9 text-xs" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="h-9 text-xs">
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Detalles del pedido */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? selectedOrder.id : ""}
        description={selectedOrder ? `Realizado el ${new Date(selectedOrder.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}` : undefined}
        className="max-w-lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <span className={`w-fit inline-block text-xs font-medium px-2.5 py-1 rounded-full ${getStatusStyles(selectedOrder.status).className}`}>
              {getStatusStyles(selectedOrder.status).label}
            </span>

            {/* Barra de progreso del pedido */}
            {!isSelectedCancelled && (
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                          index <= currentStepIndex ? "bg-brand-dark text-white" : "bg-neutral-100 text-brand-muted"
                        }`}
                      >
                        {index < currentStepIndex ? "✓" : index + 1}
                      </div>
                      <span className="text-[10px] capitalize text-brand-muted">{getStatusStyles(step).label}</span>
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <span className={`mx-1.5 h-px flex-1 ${index < currentStepIndex ? "bg-brand-dark" : "bg-border"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 border-t border-border/40 pt-5 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <span className="block text-xs text-brand-muted">Enviado a</span>
                <p className="font-medium text-brand-dark">{selectedOrder.customerName}</p>
                <p className="text-brand-muted">{selectedOrder.address}, {selectedOrder.city}</p>
                <p className="text-brand-muted">{selectedOrder.phone}</p>
              </div>
              <div className="space-y-1 text-sm sm:text-right">
                <span className="block text-xs text-brand-muted">Total del pedido</span>
                <p className="text-lg font-medium text-brand-dark">${selectedOrder.total.toLocaleString("es-CO")}</p>
                <p className="text-xs text-brand-muted">Pago: {selectedOrder.paymentStatus === "pagado" ? "Confirmado" : "Pendiente"}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/40 pt-5">
              <h3 className="text-sm font-medium text-brand-dark">Productos</h3>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-brand-dark">${(item.price * item.quantity).toLocaleString("es-CO")}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border/40 pt-3 text-sm">
                <span className="text-brand-muted">Envío</span>
                <span className="font-medium text-brand-dark">
                  {selectedOrder.shipping === 0 ? "Gratis" : `$${selectedOrder.shipping.toLocaleString("es-CO")}`}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}