"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "../../../../compents/common/PageTitle";
import { useAuthStore } from "../../../../store/auth.store";
import { useOrderStore } from "../../../../store/order.store";

const STATUS_MAP: Record<string, { label: string; cls: string; step: number }> = {
  pending:    { label: "Pendiente",  cls: "bg-stone-100 text-stone-600",                               step: 1 },
  processing: { label: "En proceso", cls: "bg-amber-50 text-amber-700 border border-amber-200",       step: 2 },
  shipped:    { label: "Enviado",    cls: "bg-blue-50 text-blue-700 border border-blue-200",          step: 3 },
  delivered:  { label: "Entregado",  cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", step: 4 },
  cancelled:  { label: "Cancelado",  cls: "bg-red-50 text-red-600 border border-red-200",             step: 0 },
};

const STEPS = ["Pendiente", "En proceso", "Enviado", "Entregado"];

export default function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const order = useOrderStore((state) => state.orders.find((o) => o.id === id));

  // Esperamos a que el store hidrate desde localStorage antes de tomar decisiones
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  // Cuando el usuario cierra sesión estando en esta página → redirigir al login
  React.useEffect(() => {
    if (!isMounted) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  // Mientras hidrata el store, no mostramos nada (evita flash de 404)
  if (!isMounted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-40 mb-6" />
        <div className="h-8 bg-stone-200 rounded w-64" />
        <div className="h-48 bg-stone-100 rounded-2xl" />
        <div className="h-64 bg-stone-100 rounded-2xl" />
      </div>
    );
  }

  // Si no hay sesión activa → null (el useEffect ya redirige)
  if (!isAuthenticated || !user) return null;

  // Si la orden no existe o no pertenece al usuario actual
  if (!order || order.email !== user.email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <p className="text-7xl font-black text-stone-200">404</p>
        <p className="text-xl font-semibold text-stone-900">Orden no encontrada</p>
        <p className="text-sm text-stone-500">
          No tienes ninguna orden con el ID{" "}
          <code className="bg-stone-100 px-2 py-0.5 rounded font-mono">{id}</code>
        </p>
        <Link
          href="/profile"
          className="text-sm font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-900"
        >
          ← Volver a mi cuenta
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
  const currentStep = status.step;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="border-b border-stone-200 pb-5">
        <Link
          href="/profile"
          className="text-xs font-semibold text-stone-400 hover:text-stone-700 transition-colors inline-flex items-center gap-1 mb-3"
        >
          ← Volver a mi cuenta
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <PageTitle
              title={order.id}
              description={`Realizado el ${order.date}`}
            />
          </div>
          <span className={`self-start text-xs font-bold px-3 py-1.5 rounded-full ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* BARRA DE PROGRESO */}
      {order.status !== "cancelled" && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
            Estado del pedido
          </h2>
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-stone-200" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-stone-900 transition-all duration-500"
              style={{ width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100)}%` }}
            />
            <div className="relative flex justify-between">
              {STEPS.map((step, i) => {
                const done = currentStep >= i + 1;
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-white border-stone-300 text-stone-300"
                    }`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide text-center ${
                      done ? "text-stone-900" : "text-stone-300"
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTOS */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">Productos</h2>
          <span className="text-xs text-stone-400">
            {order.items.length} artículo{order.items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-stone-200 to-stone-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">Cantidad: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-stone-900 flex-shrink-0">
                ${(item.price * item.quantity).toLocaleString("es-CO")}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t-2 border-stone-200 bg-stone-50">
          <span className="text-sm font-semibold text-stone-500">Total pagado</span>
          <span className="text-lg font-black text-stone-900">
            ${order.total.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

      {/* ENVÍO Y PAGO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Dirección de entrega
          </h2>
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <p className="text-sm text-stone-700 leading-relaxed">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Pago</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Estado</span>
              <span className={`font-bold ${
                order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
              }`}>
                {order.paymentStatus === "paid" ? "✓ Pagado" : "⏳ Pendiente"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Método</span>
              <span className="font-semibold text-stone-700">Tarjeta de crédito</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total</span>
              <span className="font-bold text-stone-900">
                ${order.total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SOPORTE */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900">¿Tienes un problema con este pedido?</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Nuestro equipo te responde en menos de 24 horas.
          </p>
        </div>
        <button className="flex-shrink-0 h-10 px-5 text-xs font-bold rounded-xl border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all">
          Contactar soporte
        </button>
      </div>

    </div>
  );
}