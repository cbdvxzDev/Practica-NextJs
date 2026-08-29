"use client";

import * as React from "react";
import { PageTitle } from "../../compents/common/PageTitle";
import { Button } from "../../compents/ui/Button";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emptyForm: ContactFormValues = { name: "", email: "", subject: "", message: "" };

function validate(values: ContactFormValues) {
  const errors: Partial<Record<keyof ContactFormValues, string>> = {};
  if (!values.name.trim() || values.name.trim().length < 3) errors.name = "Ingresa tu nombre completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Ingresa un correo electrónico válido.";
  if (!values.subject.trim()) errors.subject = "Cuéntanos el motivo de tu mensaje.";
  if (!values.message.trim() || values.message.trim().length < 10) errors.message = "Tu mensaje debe tener al menos 10 caracteres.";
  return errors;
}

export default function ContactPage() {
  const [values, setValues] = React.useState<ContactFormValues>(emptyForm);
  const [errors, setErrors] = React.useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [sent, setSent] = React.useState(false);

  const handleChange = (field: keyof ContactFormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Demo: no hay backend de correo conectado, solo confirmamos la recepción localmente.
    setSent(true);
    setValues(emptyForm);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Contacto"
        subtitle="¿Tienes una pregunta sobre tu pedido o nuestros productos? Escríbenos y te responderemos lo antes posible."
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="space-y-1 rounded-card border border-border/60 bg-white p-5">
          <span className="text-xs text-brand-muted block">Correo</span>
          <p className="text-sm font-medium text-brand-dark">soporte@nova.com</p>
        </div>
        <div className="space-y-1 rounded-card border border-border/60 bg-white p-5">
          <span className="text-xs text-brand-muted block">Teléfono</span>
          <p className="text-sm font-medium text-brand-dark">+57 (601) 555-0199</p>
        </div>
        <div className="space-y-1 rounded-card border border-border/60 bg-white p-5">
          <span className="text-xs text-brand-muted block">Horario</span>
          <p className="text-sm font-medium text-brand-dark">Lun a Sáb, 8am–6pm</p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-card border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-emerald-800">¡Gracias por escribirnos!</p>
          <p className="mt-1 text-sm text-emerald-700">Hemos recibido tu mensaje y te responderemos muy pronto.</p>
          <Button variant="secondary" className="mt-4 h-9 text-xs" onClick={() => setSent(false)}>
            Enviar otro mensaje
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-card border border-border/60 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium">
              Nombre completo
              <input
                value={values.name}
                onChange={handleChange("name")}
                aria-invalid={Boolean(errors.name)}
                className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
              />
              {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}
            </label>
            <label className="text-xs font-medium">
              Correo electrónico
              <input
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                aria-invalid={Boolean(errors.email)}
                className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
              />
              {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
            </label>
          </div>
          <label className="block text-xs font-medium">
            Asunto
            <input
              value={values.subject}
              onChange={handleChange("subject")}
              aria-invalid={Boolean(errors.subject)}
              placeholder="Ej. Estado de mi pedido ORD-2026-0001"
              className="mt-2 h-11 w-full rounded-button border border-border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
            {errors.subject && <span className="mt-1 block text-xs text-red-600">{errors.subject}</span>}
          </label>
          <label className="block text-xs font-medium">
            Mensaje
            <textarea
              value={values.message}
              onChange={handleChange("message")}
              aria-invalid={Boolean(errors.message)}
              rows={5}
              className="mt-2 w-full resize-none rounded-button border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
            />
            {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}
          </label>
          <Button type="submit" className="h-11 w-full sm:w-auto sm:px-8">Enviar mensaje</Button>
        </form>
      )}
    </div>
  );
}
