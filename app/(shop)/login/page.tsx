"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../compents/forms/LoginForm";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@giborsec.com", password: "admin123" },
  { label: "Cliente", email: "carlos@example.com", password: "carlos123" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [demoError, setDemoError] = React.useState("");

  const finishLogin = (user: { id: string; email: string; name: string; role: string }) => {
    setAuth({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === "admin" ? "admin" : user.role === "support" ? "support" : "customer",
    });
    router.push(user.role === "admin" ? "/admin/dashboard" : "/");
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