"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserService, type UserAdmin } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { ROLES } from "@/constants/roles";
import { Button } from "@/components/ui/Button";
import type { DbOrder } from "@/types/db";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: ROLES.CUSTOMER, label: "Cliente" },
  { value: ROLES.SUPPORT, label: "Soporte" },
  { value: ROLES.ADMIN, label: "Administrador" },
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  delivered: { label: "Entregado", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  shipped: { label: "Enviado", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  processing: { label: "En proceso", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  pending: { label: "Pendiente", cls: "bg-neutral-50 text-neutral-600 border border-neutral-200" },
  cancelled: { label: "Cancelado", cls: "bg-red-50 text-red-600 border border-red-200" },
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAuthStore((state) => state.user?.role);
  const sessionId = useAuthStore((state) => state.user?.id);
  const updateUser = useUserStore((state) => state.updateUser);
  const [user, setUser] = React.useState<(UserAdmin & { orders?: DbOrder[] }) | null>(null);
  const [state, setState] = React.useState<"loading" | "ready" | "missing">("loading");

  // Borrador de la ficha de gestión: `null` significa "sin cambios pendientes",
  // así se evita un effect que sincronice estado con props.
  const [draft, setDraft] = React.useState<{ role: UserAdmin["role"]; isActive: boolean } | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "ok" | "error"; text: string } | null>(null);

  // Igual que el listado: la API responde 403 a soporte, así que ni se pide.
  const isForbidden = role !== undefined && role !== ROLES.ADMIN;

  React.useEffect(() => {
    // El bloqueo se resuelve en el render (más abajo); aquí solo se evita
    // llamar a una API que respondería 403.
    if (isForbidden) return;
    let cancelled = false;
    UserService.getById(id)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [id, isForbidden]);

  const values = draft ?? (user ? { role: user.role, isActive: user.isActive } : null);
  const dirty = draft !== null && user !== null && (draft.role !== user.role || draft.isActive !== user.isActive);
  // Un administrador no puede bajarse a sí mismo: se quedaría sin poder entrar.
  const isSelf = user !== null && sessionId !== undefined && user.id === sessionId;
  const locked = Boolean(isSelf) || saving;

  const handleSave = async () => {
    if (!dirty || locked || draft === null || user === null) return;
    setSaving(true);
    setFeedback(null);
    try {
      const updated = await updateUser(user.id, draft);
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      setDraft(null);
      setFeedback({ type: "ok", text: "Cambios guardados." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudieron guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isForbidden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-6xl font-black text-stone-200">403</p>
        <p className="text-xl font-semibold text-stone-900">Sección restringida a administradores</p>
        <p className="text-xs text-stone-500 max-w-xs">
          Tu rol de soporte puede gestionar pedidos, pero no las cuentas de usuario.
        </p>
        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-stone-700 underline underline-offset-4"
        >
          ← Ir a los pedidos
        </Link>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-neutral-100 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-neutral-100 rounded-2xl" />
      </div>
    );
  }

  if (state === "missing" || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-6xl font-black text-stone-200">404</p>
        <p className="text-xl font-semibold text-stone-900">Cliente no encontrado</p>
        <Link
          href="/admin/users"
          className="text-sm font-semibold text-stone-700 underline underline-offset-4"
        >
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  const orders = user.orders ?? [];
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
  const joinedAt = new Date(user.createdAt).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const stats = [
    { label: "Órdenes", value: orders.length },
    { label: "Total gastado", value: `$${totalSpent.toLocaleString("es-CO")}` },
    { label: "Rol", value: user.role === "admin" ? "Administrador" : user.role === "support" ? "Soporte" : "Cliente" },
    { label: "Miembro desde", value: joinedAt },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-stone-200 pb-5 space-y-3">
        <Link
          href="/admin/users"
          className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors inline-flex items-center gap-1"
        >
          ← Volver a clientes
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-stone-900 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{user.name}</h1>
            <p className="text-sm text-stone-400 mt-0.5">
              {user.email} · {user.isActive ? "Cuenta activa" : "Cuenta inactiva"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
              {s.label}
            </p>
            <p className="text-lg font-bold text-stone-900 leading-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900">Historial de compras</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {orders.length} órdenes registradas
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-700">Sin compras aún</p>
              <p className="text-xs text-stone-400">Este usuario no ha realizado pedidos.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  <th className="py-3 px-6 text-left">Orden</th>
                  <th className="py-3 px-6 text-left">Fecha</th>
                  <th className="py-3 px-6 text-center">Artículos</th>
                  <th className="py-3 px-6 text-right">Total</th>
                  <th className="py-3 px-6 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const st = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
                  const itemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-stone-700">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline underline-offset-4">
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-stone-500 text-xs">
                        {new Date(order.date).toLocaleDateString("es-CO")}
                      </td>
                      <td className="py-4 px-6 text-center text-stone-700">{itemCount}</td>
                      <td className="py-4 px-6 text-right font-bold text-stone-900">
                        ${order.total.toLocaleString("es-CO")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6 h-fit">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Información de cuenta
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Correo</p>
                <p className="text-stone-700 mt-0.5 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rol</p>
                <p className="text-stone-700 mt-0.5 capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Estado</p>
                <p className={`mt-0.5 font-medium ${user.isActive ? "text-emerald-600" : "text-red-600"}`}>
                  {user.isActive ? "● Activo" : "○ Inactivo"}
                </p>
              </div>
            </div>
          </div>

        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Gestión de cuenta
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {isSelf
                ? "Es tu propia cuenta: no puedes cambiar tu rol ni darte de baja."
                : "Cambia el rol o corta el acceso a la plataforma."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="user-role"
                className="text-[10px] font-bold uppercase tracking-widest text-stone-400"
              >
                Rol
              </label>
              <select
                id="user-role"
                value={values?.role ?? user.role}
                disabled={locked}
                onChange={(e) =>
                  setDraft({
                    role: e.target.value as UserAdmin["role"],
                    isActive: values?.isActive ?? user.isActive,
                  })
                }
                className="mt-1 w-full h-9 px-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 disabled:opacity-50"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Acceso
              </span>
              <button
                type="button"
                disabled={locked}
                onClick={() =>
                  setDraft({
                    role: values?.role ?? user.role,
                    isActive: !(values?.isActive ?? user.isActive),
                  })
                }
                className={`w-full h-9 text-xs font-medium rounded-xl border transition-colors disabled:opacity-50 ${
                  (values?.isActive ?? user.isActive)
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {(values?.isActive ?? user.isActive) ? "Desactivar cuenta" : "Activar cuenta"}
              </button>
            </div>

            {feedback && (
              <p
                role="status"
                className={`text-xs ${feedback.type === "ok" ? "text-emerald-600" : "text-red-600"}`}
              >
                {feedback.text}
              </p>
            )}

            <Button
              variant="primary"
              className="w-full h-9 text-xs"
              onClick={handleSave}
              isLoading={saving}
              disabled={!dirty}
            >
              {dirty ? "Guardar cambios" : "Sin cambios"}
            </Button>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}