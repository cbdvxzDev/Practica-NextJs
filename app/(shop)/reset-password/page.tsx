"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-dark/20 border-t-brand-dark" />
        </div>
      }
    >
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
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
            Elige una contraseña nueva
          </h1>
        </div>

        {!token ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-3">
              El enlace de recuperación no es válido. Solicita uno nuevo para continuar.
            </p>
            <Link href="/forgot-password" className="font-medium text-brand-dark text-sm hover:underline underline-offset-4">
              Solicitar un enlace nuevo
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-brand-dark bg-brand-light/50 border border-border/60 rounded-button px-3 py-3">
              Contraseña actualizada. Ya puedes entrar con tus credenciales nuevas.
            </p>
            <Link href="/login" className="inline-block">
              <Button variant="primary" className="h-10 px-6 text-xs font-semibold uppercase tracking-wider">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nueva contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Repite la contraseña"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
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
              {isSubmitting ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
