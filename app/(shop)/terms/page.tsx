import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos del servicio",
  description: "Condiciones de uso de la tienda y de tus compras en línea.",
};

const SECTIONS = [
  {
    title: "Uso de la plataforma",
    items: [
      "Esta tienda y su contenido están destinados a personas mayores de 18 años.",
      "Es tu responsabilidad conservar la confidencialidad de tus credenciales.",
      "Queda prohibido el uso de la plataforma con fines fraudulentos o ilícitos.",
    ],
  },
  {
    title: "Compras y pagos",
    items: [
      "El precio mostrado incluye IVA y está expresado en pesos colombianos (COP).",
      "La disponibilidad y el stock de cada pieza se actualizan al confirmar la orden.",
      "Nos reservamos el derecho de rechazar una orden si no se puede verificar el pago.",
    ],
  },
  {
    title: "Productos",
    items: [
      "Las imágenes son de referencia; el color y la textura pueden variar ligeramente entre dispositivos.",
      "Las descripciones buscan ser exactas, pero el tejido y el acabado pueden presentar variaciones naturales.",
    ],
  },
  {
    title: "Propiedad intelectual",
    items: [
      "El diseño, logo, imágenes y textos de la tienda son propiedad de la marca y no pueden reproducirse sin autorización.",
    ],
  },
  {
    title: "Limitación de responsabilidad",
    items: [
      "No somos responsables por retrasos ajenos a nuestro control (clima, transportadoras, casos de fuerza mayor).",
      "Nuestra responsabilidad se limita al valor del pedido afectado.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">Términos del servicio</h1>
        <p className="text-sm text-brand-muted mt-1">
          Las reglas que rigen el uso de la tienda y de tus compras.
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
    </div>
  );
}