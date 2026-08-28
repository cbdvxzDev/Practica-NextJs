"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export interface LoginFormProps {
  onSubmit?: (email: string, pass: string) => void;
  adminOnly?: boolean;
  className?: string;
}

export function LoginForm({ onSubmit, className, adminOnly = false }: LoginFormProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setError("");
    void AuthService.login(email, password)
      .then((response) => {
        if (adminOnly && response.user.role !== "admin") throw new Error("Esta cuenta no tiene permisos de administrador.");
        setAuth(response.user);
        onSubmit?.(email, password);
        router.push(response.user.role === "admin" ? "/admin/dashboard" : "/profile");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No pudimos iniciar sesión."))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("w-full max-w-sm bg-white p-6 border border-border/40 rounded-card space-y-5", className)}
    >
      <div className="space-y-1 text-center pb-2 border-b border-border/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Ingresar a tu Cuenta
        </h2>
        <p className="text-[11px] text-brand-muted">
          Introduce tus credenciales para continuar.
        </p>
      </div>

      {/* CORREO ELECTRÓNICO */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-brand-dark">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@ejemplo.com"
          className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
        />
      </div>

      {/* CONTRASEÑA */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="password" className="font-medium text-brand-dark">
            Contraseña
          </label>
          <button 
            type="button"
            className="text-brand-muted hover:text-brand-dark transition-colors underline underline-offset-4 text-[11px]"
          >
            ¿La olvidaste?
          </button>
        </div>
        <div className="relative flex items-center">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10 w-full pl-3 pr-10 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark tracking-wide"
          />
          
          {/* BOTÓN DISCRETO PARA VISUALIZAR CONTRASEÑA */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-brand-muted hover:text-brand-dark transition-colors text-[10px] uppercase font-semibold tracking-wider select-none focus:outline-none"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      {/* ACCIÓN PRINCIPAL */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 text-xs font-semibold uppercase tracking-wider shadow-subtle"
        >
          {isSubmitting ? "Autenticando..." : "Iniciar Sesión"}
        </Button>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
    </form>
  );
}