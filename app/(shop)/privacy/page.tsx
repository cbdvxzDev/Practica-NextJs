import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Políticas de privacidad",
  description: "Conoce cómo tratamos y protegemos tus datos personales en nuestra tienda.",
};

const SECTIONS = [
  {
    title: "Información que recopilamos",
    items: [
      "Datos de cuenta: nombre, correo electrónico y contraseña cifrada.",
      "Datos de pedido: dirección de envío e historial de compras.",
      "Datos técnicos: tipo de dispositivo, navegador y páginas visitadas, únicamente con fines estadísticos.",
    ],
  },
  {
    title: "Uso de la información",
    items: [
      "Gestionar tu cuenta, pedidos y devoluciones.",
      "Enviarte actualizaciones sobre el estado de tus compras.",
      "Mejorar la experiencia, el catálogo y el servicio al cliente.",
      "Nunca vendemos ni compartimos tus datos con terceros con fines comerciales.",
    ],
  },
  {
    title: "Seguridad",
    items: [
      "Las contraseñas se almacenan cifradas con algoritmos seguros (scrypt).",
      "Las comunicaciones usan conexiones cifradas (HTTPS).",
      "El acceso al panel administrativo está restringido por roles.",
    ],
  },
  {
    title: "Tus derechos",
    items: [
      "Acceder, rectificar o eliminar tus datos en cualquier momento.",
      "Cancelar el envío de comunicaciones comerciales.",
      "Solicitar información sobre el tratamiento de tus datos escribiendo a soporte@esencial.store.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">Políticas de privacidad</h1>
        <p className="text-sm text-brand-muted mt-1">
          Tu privacidad es importante. Estos son los principios que seguimos.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-brand-muted leading-relaxed">
                  <span className="text-brand-accent shrink-0" aria-hidden="true">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="bg-neutral-50/60 border border-border/40 rounded-card p-5 text-xs text-brand-muted leading-relaxed">
        <p>
          Última actualización: enero de 2026. Esta política puede actualizarse periódicamente; los cambios se publicarán en esta página.
        </p>
      </div>
    </div>
  );
}