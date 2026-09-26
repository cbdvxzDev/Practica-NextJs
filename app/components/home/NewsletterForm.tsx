"use client";

import * as React from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "../ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "done" | "error">("idle");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    setStatus(isValid ? "done" : "error");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center rounded-card border border-border bg-white p-6 sm:p-10 shadow-subtle">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
          <Mail className="h-3.5 w-3.5" />
          Carta Esencial
        </span>
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-brand-dark">
          Una carta al mes, nada más
        </h2>
        <p className="text-sm text-brand-muted leading-relaxed max-w-md">
          Novedades de la colección, avisos de rebajas y tips de tallas. Sin spam y
          puedes salir cuando quieras.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Correo electrónico
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="tucorreo@ejemplo.com"
            className="h-11 flex-1 rounded-button border border-border bg-white px-4 text-sm text-brand-dark placeholder:text-neutral-400 transition-colors focus:border-brand-dark"
          />
          <Button type="submit" className="h-11 px-6 text-sm text-white">
            Suscribirme
          </Button>
        </div>

        {status === "done" && (
          <p className="flex items-center gap-2 text-xs text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            ¡Listo! Te escribiremos a {email.trim()} con la próxima carta.
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-xs text-red-600">
            Revisa el correo: no parece una dirección válida.
          </p>
        )}

        <p className="text-[11px] text-brand-muted">
          Al suscribirte aceptas la{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-brand-dark">
            política de privacidad
          </a>
          .
        </p>
      </form>
    </div>
  );
}
