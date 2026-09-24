import type { Metadata } from "next";
import { CONFIG } from "../../constants/config";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos, nos encantará resolver tus dudas sobre productos envíos y devoluciones.",
};

const CHANNELS = [
  {
    label: "Correo electrónico",
    value: CONFIG.site.contactEmail,
    href: `mailto:${CONFIG.site.contactEmail}`,
    note: "Respuesta en menos de 24 horas hábiles.",
  },
  {
    label: "Horario de atención",
    value: "Lunes a viernes · 8:00 a 17:00",
    note: "Hora de Colombia (GMT-5).",
  },
  {
    label: "Redes sociales",
    value: "@esencial.store",
    note: "Historias diarias, lookbooks y novedades.",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">Contacto</h1>
        <p className="text-sm text-brand-muted mt-1">
          ¿Tienes una duda sobre tus pedidos, tallas o el estado de tu compra? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CHANNELS.map((channel) => (
          <div key={channel.label} className="bg-white border border-border/60 rounded-card p-6 space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              {channel.label}
            </p>
            {channel.href ? (
              <a
                href={channel.href}
                className="text-lg font-medium text-brand-dark hover:text-brand-accent transition-colors break-words"
              >
                {channel.value}
              </a>
            ) : (
              <p className="text-lg font-medium text-brand-dark">{channel.value}</p>
            )}
            <p className="text-xs text-brand-muted">{channel.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50/60 border border-border/40 rounded-card p-6 text-sm text-brand-muted leading-relaxed space-y-2">
        <p>
          Para el estado de un pedido, adjunta tu número de orden (formato <span className="font-mono text-brand-dark">ORD-2026-XXX</span>) para que podamos ayudarte más rápido.
        </p>
        <p>
          Nuestro equipo de soporte lee cada mensaje con detalle y responde por el mismo medio por el que nos escribiste.
        </p>
      </div>
    </div>
  );
}