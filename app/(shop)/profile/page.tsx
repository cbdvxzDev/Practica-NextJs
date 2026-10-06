"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "../../components/common/PageTitle";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useAuthStore } from "../../store/auth.store";
import { useOrderStore } from "../../store/order.store";
import { useIsMounted } from "../../hooks/useIsMounted";
import { isOrderOwnedBy } from "../../utils/orderOwnership";
import { OrderList } from "../../components/order/OrderList";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const allOrders = useOrderStore((state) => state.orders);
  const isMounted = useIsMounted();

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");

  // Refleja el usuario del store en el formulario. Se ajusta durante el render
  // en lugar de un efecto para no disparar un render en cascada.
  const [syncedUser, setSyncedUser] = React.useState({ name: user?.name, email: user?.email });
  if (syncedUser.name !== user?.name || syncedUser.email !== user?.email) {
    setSyncedUser({ name: user?.name, email: user?.email });
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }

  // Sin usuario no hay historial propio que filtrar (aún no sabemos si hay
  // sesión: el store persistido se hidrata después del primer render).
  const myOrders = user ? allOrders.filter((o) => isOrderOwnedBy(o, user)) : [];

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

  /* /profile está en PROTECTED_ROUTES, pero la página se renderiza en el
     cliente: sin este guard, un visitante sin sesión veía el perfil vacío
     con "—" en todos los campos. Se espera a hidratar el store persistido
     para noGatear al usuario real durante la hidratación de React. */
  if (isMounted && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Inicia sesión para ver tu cuenta</h1>
          <p className="text-sm text-brand-muted max-w-sm mx-auto">
            Accede a tu perfil para revisar tus datos personales y el historial de tus pedidos.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="primary" className="h-11 px-6">Iniciar sesión</Button></Link>
          <Link href="/register"><Button variant="outline" className="h-11 px-6">Crear cuenta</Button></Link>
        </div>
      </div>
    );
  }

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
              <p className="text-brand-muted">
                {user?.role === "admin"
                  ? "Administrador"
                  : user?.role === "support"
                    ? "Soporte"
                    : "Cliente"}
              </p>
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

          <OrderList orders={myOrders} />
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