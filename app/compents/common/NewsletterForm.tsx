"use client";

import * as React from "react";
import { Button } from "../ui/Button";

export function NewsletterForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="mx-auto mt-6 max-w-md text-sm font-medium text-brand-dark">
        ¡Gracias por suscribirte! Pronto recibirás nuestras mejores ofertas.
      </p>
    );
  }

  return (
    <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="tucorreo@ejemplo.com"
        className="h-11 w-full rounded-button border border-border bg-white px-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
      />
      <Button type="submit" className="h-11 shrink-0 px-6">Suscribirme</Button>
    </form>
  );
}
