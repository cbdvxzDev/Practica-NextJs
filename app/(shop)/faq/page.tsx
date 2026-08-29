"use client";

import * as React from "react";
import { PageTitle } from "../../compents/common/PageTitle";

const FAQ_ITEMS = [
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "La entrega estándar tarda entre 2 y 5 días hábiles dentro de las principales ciudades. Para zonas rurales o apartadas el tiempo puede extenderse hasta 8 días hábiles. Recibirás un correo con el número de seguimiento apenas tu pedido sea despachado.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express. Todo el proceso de pago es una demostración segura: no se realiza ningún cobro real en este entorno de práctica.",
  },
  {
    question: "¿Puedo hacer seguimiento de mi pedido sin crear una cuenta?",
    answer:
      "Sí. Utiliza la sección \"Rastrear pedido\" en el menú principal, ingresa tu número de orden (por ejemplo ORD-2026-0001) y el correo con el que compraste para ver el estado en tiempo real.",
  },
  {
    question: "¿Cómo cambio o cancelo un pedido ya realizado?",
    answer:
      "Si tu pedido aún está en estado \"Pendiente\" o \"En proceso\", escríbenos a través de la página de Contacto indicando tu número de orden y el cambio que necesitas. Una vez el pedido es enviado, no es posible modificarlo.",
  },
  {
    question: "¿Hacen envíos a toda Colombia?",
    answer:
      "Sí, realizamos envíos a nivel nacional a través de nuestros aliados logísticos. Los costos y tiempos varían según la ciudad de destino y se calculan automáticamente en el checkout.",
  },
  {
    question: "¿Qué pasa si un producto llega defectuoso?",
    answer:
      "Cuentas con 30 días calendario desde la entrega para solicitar cambio o devolución sin costo si el producto presenta algún defecto de fábrica. Consulta todos los detalles en nuestra página de Envíos y devoluciones.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Preguntas frecuentes"
        subtitle="Resolvemos las dudas más comunes sobre compras, envíos y pagos en NOVA."
      />

      <div className="divide-y divide-border/60 rounded-card border border-border/60 bg-white">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm font-medium text-brand-dark">{item.question}</span>
                <span className={`shrink-0 text-lg text-brand-muted transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-brand-muted">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-brand-muted">
        ¿No encontraste lo que buscabas? Visita nuestra página de{" "}
        <a href="/contact" className="underline underline-offset-4 hover:text-brand-dark">Contacto</a>.
      </p>
    </div>
  );
}
