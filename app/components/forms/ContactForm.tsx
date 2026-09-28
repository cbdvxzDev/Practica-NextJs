"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL_PATTERN } from "@/lib/validation";
import {
  CONTACT_TOPIC_OPTIONS,
  ContactService,
  type ContactFormData,
} from "@/services/contact.service";
import type { DbContactTopic } from "@/types/db";
import { Button } from "../ui/Button";

type Status = "idle" | "sending" | "done" | "error";

const EMPTY: ContactFormData = {
  name: "",
  email: "",
  topic: "pedido",
  message: "",
  website: "",
};

/** Errores por campo, para poder marcar el input concreto. */
type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

const MAX_MESSAGE = 2000;
const FIELD_CLASS =
  "w-full px-3 py-2.5 text-sm border rounded-button bg-white text-brand-dark placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-dark disabled:opacity-60";

export function ContactForm() {
  const [formData, setFormData] = React.useState<ContactFormData>(EMPTY);
  const [status, setStatus] = React.useState<Status>("idle");
  const [statusMessage, setStatusMessage] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const isSending = status === "sending";

  function update<K extends keyof ContactFormData>(field: K, value: ContactFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Al escribir en un campo con error, se limpia su marca.
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  /**
   * Misma regla que el servidor (`app/lib/validation.ts`). Se valida aquí para
   * dar respuesta inmediata, pero la validación que manda es la del endpoint.
   */
  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!formData.name.trim()) errors.name = "Escribe tu nombre.";
    else if (formData.name.trim().length > 80) errors.name = "Máximo 80 caracteres.";

    const email = formData.email.trim();
    if (!email) errors.email = "Necesitamos un correo para responderte.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Ese correo no parece válido.";

    const message = formData.message.trim();
    if (!message) errors.message = "Cuéntanos en qué podemos ayudarte.";
    else if (message.length < 10) errors.message = "Un poco más de detalle nos ayuda.";
    else if (message.length > MAX_MESSAGE) errors.message = `Máximo ${MAX_MESSAGE} caracteres.`;

    return errors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("error");
      setStatusMessage("Revisa los campos marcados.");
      // Foco en el primer problema: en móvil evita el scroll a ciegas.
      const first = Object.keys(errors)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setStatusMessage("");

    try {
      const result = await ContactService.send({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
      });
      setStatus("done");
      setStatusMessage(result.message);
      setFormData(EMPTY);
      setFieldErrors({});
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "No pudimos enviar el mensaje."
      );
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="rounded-card border border-emerald-200 bg-emerald-50/60 p-8 text-center space-y-3"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-medium text-brand-dark">Mensaje enviado</h2>
        <p className="text-sm text-brand-muted max-w-sm mx-auto">{statusMessage}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStatus("idle");
            setStatusMessage("");
          }}
        >
          Escribir otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          id="contact-name"
          label="Nombre"
          error={fieldErrors.name}
          required
        >
          <input
            id="contact-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={isSending}
            autoComplete="name"
            placeholder="Tu nombre"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
            className={cn(FIELD_CLASS, fieldErrors.name && "border-red-400 focus:ring-red-400")}
          />
        </Field>

        <Field
          id="contact-email"
          label="Correo electrónico"
          error={fieldErrors.email}
          required
        >
          <input
            id="contact-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={isSending}
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
            className={cn(FIELD_CLASS, fieldErrors.email && "border-red-400 focus:ring-red-400")}
          />
        </Field>
      </div>

      <Field id="contact-topic" label="Motivo">
        <select
          id="contact-topic"
          name="topic"
          value={formData.topic}
          onChange={(e) => update("topic", e.target.value as DbContactTopic)}
          disabled={isSending}
          className={cn(FIELD_CLASS, "cursor-pointer")}
        >
          {CONTACT_TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="contact-message"
        label="Mensaje"
        error={fieldErrors.message}
        required
        hint={`${formData.message.trim().length}/${MAX_MESSAGE}`}
      >
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={formData.message}
          onChange={(e) => update("message", e.target.value)}
          disabled={isSending}
          placeholder="Cuéntanos qué necesitas. Si es sobre un pedido, incluye su número (ORD-2026-XXX)."
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
          className={cn(
            FIELD_CLASS,
            "resize-y min-h-32",
            fieldErrors.message && "border-red-400 focus:ring-red-400"
          )}
        />
      </Field>

      {/* Trampa anti-bots, igual que en el newsletter. */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">No rellenes esto</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={isSending}
          isLoading={isSending}
          className="sm:w-auto h-11 px-6 text-sm"
        >
          {isSending ? "Enviando..." : "Enviar mensaje"}
        </Button>

        <p aria-live="polite" className="text-xs">
          {status === "error" && statusMessage && (
            <span role="alert" className="flex items-center gap-1.5 text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {statusMessage}
            </span>
          )}
          {isSending && (
            <span className="flex items-center gap-1.5 text-brand-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Enviando tu mensaje...
            </span>
          )}
        </p>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Etiqueta + control + mensaje de error, con el marcado de accesibilidad ya resuelto. */
function Field({ id, label, error, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-xs font-medium text-brand-dark">
          {label}
          {required && <span className="text-brand-accent ml-0.5">*</span>}
        </label>
        {hint && !error && <span className="text-[11px] text-brand-muted tabular-nums">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-[11px] text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
