"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "../../components/forms/LoginForm";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";

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
