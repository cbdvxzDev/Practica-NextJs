"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, Mail } from "lucide-react";
import { Button } from "../ui/Button";
import { NewsletterService } from "@/services/newsletter.service";
import { EMAIL_PATTERN } from "@/lib/validation";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState("");
  // Campo trampa: invisible para el usuario, tentador para los bots.
  const [honeypot, setHoneypot] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const candidate = email.trim();
    if (!EMAIL_PATTERN.test(candidate)) {
      setStatus("error");
      setMessage("Revisa el correo: no parece una dirección válida.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const result = await NewsletterService.subscribe(candidate, honeypot);
      setStatus("done");
      setMessage(
        result.alreadySubscribed
          ? `Ya estabas en la lista, ${candidate}.`
          : `¡Listo! Te escribiremos a ${candidate} con la próxima carta.`
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No pudimos guardar tu correo.");
    }
  }

  function handleChange(value: string) {
    setEmail(value);
    // Al corregir, el error desaparece: no hay queванеjar para ver el cambio.
    if (status === "error" || status === "done") {
      setStatus("idle");
      setMessage("");
    }
  }

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
            name="email"
            type="email"
            value={email}
            onChange={(event) => handleChange(event.target.value)}
            disabled={status === "sending"}
            aria-invalid={status === "error"}
            aria-describedby="newsletter-feedback"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            className="h-11 flex-1 rounded-button border border-border bg-white px-4 text-sm text-brand-dark placeholder:text-neutral-400 transition-colors focus:border-brand-dark disabled:opacity-60"
          />
          <Button
            type="submit"
            className="h-11 px-6 text-sm text-white"
            disabled={status === "sending"}
            isLoading={status === "sending"}
          >
            Suscribirme
          </Button>
        </div>

        {/* Trampa anti-bots: oculta a la vista y a los lectores de pantalla. */}
        <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="newsletter-website">No rellenes esto</label>
          <input
            id="newsletter-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {/* Un solo live region: los lectores de pantalla anuncian el cambio. */}
        <div id="newsletter-feedback" aria-live="polite">
          {status === "sending" && (
            <p className="flex items-center gap-2 text-xs text-brand-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando tu correo...
            </p>
          )}
          {status === "done" && (
            <p className="flex items-center gap-2 text-xs text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {message}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {message}
            </p>
          )}
        </div>

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
