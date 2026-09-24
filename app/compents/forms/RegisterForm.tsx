"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void> | void;
  className?: string;
}

export function RegisterForm({ onSubmit, className }: RegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  const [formData, setFormData] = React.useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-sm bg-white p-6 border border-border/40 rounded-card space-y-4", className)}
    >
      <div className="space-y-1 text-center pb-2 border-b border-border/30">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Crear una Cuenta
        </h2>
        <p className="text-[11px] text-brand-muted">
          Regístrate para gestionar tus pedidos y envíos.
        </p>
      </div>

      {/* NOMBRE COMPLETO */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-brand-dark">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="ej. Carolina Herrera"
          className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
        />
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
          value={formData.email}
          onChange={handleChange}
          placeholder="nombre@ejemplo.com"
          className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
        />
      </div>

      {/* CONTRASEÑA */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium text-brand-dark">
          Contraseña
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            className="h-10 w-full pl-3 pr-10 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark tracking-wide"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-brand-muted hover:text-brand-dark transition-colors text-[10px] uppercase font-semibold tracking-wider select-none focus:outline-none"
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      {/* ACEPTACIÓN DE TÉRMINOS Y CONDICIONES */}
      <div className="flex items-start space-x-2.5 pt-1.5">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          required
          checked={formData.acceptTerms}
          onChange={handleChange}
          className="h-4 w-4 rounded border-border/60 text-brand-dark focus:ring-brand-dark focus:ring-0 cursor-pointer mt-0.5 accent-brand-dark"
        />
        <label htmlFor="acceptTerms" className="text-[11px] text-brand-muted leading-tight cursor-pointer select-none">
          Acepto los <button type="button" className="text-brand-dark underline underline-offset-2 font-medium">Términos de servicio</button> y la <button type="button" className="text-brand-dark underline underline-offset-2 font-medium">Política de privacidad</button>.
        </label>
      </div>

      {/* ERROR DE REGISTRO */}
      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {/* ACCIÓN PRINCIPAL */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 text-xs font-semibold uppercase tracking-wider shadow-subtle"
        >
          {isSubmitting ? "Creando cuenta..." : "Registrarme"}
        </Button>
      </div>
    </form>
  );
}