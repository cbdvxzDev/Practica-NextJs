"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<{ message: string; resetUrl?: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      setResult(await AuthService.forgotPassword(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
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
            Recupera tu contraseña
          </h1>
          <p className="text-sm text-brand-muted">
            Escribe el correo de tu cuenta y te enviamos un enlace para elegir una contraseña nueva.
          </p>
        </div>

        {result ? (
          <div className="space-y-4">
            <p className="text-xs text-brand-dark bg-brand-light/50 border border-border/60 rounded-button px-3 py-3">
              {result.message}
            </p>

            {result.resetUrl && (
              <div className="space-y-2">
                <Link href={result.resetUrl} className="block">
                  <Button variant="primary" className="w-full h-10 text-xs font-semibold uppercase tracking-wider">
                    Abrir el enlace de recuperación
                  </Button>
                </Link>
                <p className="text-[11px] text-brand-muted text-center">
                  Esta demostración no envía correos: el enlace se muestra aquí mismo en vez de llegar a tu bandeja.
                </p>
              </div>
            )}

            <p className="text-center text-sm">
              <Link href="/login" className="font-medium text-brand-dark hover:underline underline-offset-4">
                Volver a iniciar sesión
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {error && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 text-xs font-semibold uppercase tracking-wider shadow-subtle"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </Button>

            <p className="text-center text-sm text-brand-muted">
              <Link href="/login" className="font-medium text-brand-dark hover:underline underline-offset-4">
                ← Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
