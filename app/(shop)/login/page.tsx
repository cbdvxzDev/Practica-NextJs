"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "../../components/forms/LoginForm";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@giborsec.com", password: "admin123" },
  { label: "Cliente", email: "carlos@example.com", password: "carlos123" },
];

/**
 * Solo se aceptan rutas internas. Sin esta comprobación, `/login?next=https://otro-sitio`
 * convertiría el login en un redirector abierto.
 */
function safeNextPath(next: string | null, role: string): string {
  const isStaff = role === "admin" || role === "support";
  const defaultPath = isStaff ? ROUTES.ADMIN.DASHBOARD : ROUTES.HOME;

  if (!next || !next.startsWith("/") || next.startsWith("//")) return defaultPath;
  if (next.startsWith("/admin") && !isStaff) return defaultPath;
  if (next.startsWith("/login") || next.startsWith("/register")) return defaultPath;

  return next;
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-dark/20 border-t-brand-dark" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [demoError, setDemoError] = React.useState("");

  const finishLogin = (user: { id: string; email: string; name: string; role: string }) => {
    setAuth({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "admin" ? "admin" : user.role === "support" ? "support" : "customer",
    });
    router.push(safeNextPath(searchParams.get("next"), user.role));
  };

  const handleSubmit = async (email: string, password: string) => {
    const user = await AuthService.login(email, password);
    finishLogin(user);
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setDemoError("");
    try {
      await handleSubmit(email, password);
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="w-full max-w-md space-y-8 bg-white border border-border/60 rounded-card p-8 shadow-subtle">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-auto flex items-center justify-center font-semibold tracking-wider text-xl uppercase">
            Esencial
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-brand-dark">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-brand-muted">
            Ingresa tus credenciales para acceder a tu cuenta personal.
          </p>
        </div>

        <LoginForm onSubmit={handleSubmit} />

        <div className="border-t border-dashed border-amber-300 bg-amber-50/60 rounded-card p-4 space-y-2">
          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider text-center">
            ⚡ Accesos rápidos de prueba (base de datos local)
          </p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account.email, account.password)}
                className="flex-1 h-9 text-xs font-medium rounded-button bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                {account.label}
              </button>
            ))}
          </div>
          {demoError && (
            <p className="text-[11px] text-red-600 text-center">{demoError}</p>
          )}
        </div>

        <div className="text-center pt-2 border-t border-border/40">
          <p className="text-sm text-brand-muted">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="font-medium text-brand-dark hover:underline underline-offset-4 transition-all">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
