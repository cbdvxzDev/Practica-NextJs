import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envíos y devoluciones",
  description: "Conoce las condiciones de envío, plazos de entrega y política de devoluciones de nuestra tienda.",
};

const SHIPPING_INFO = [
  {
    title: "Preparación",
    text: "Todos los pedidos se preparan en un plazo de 1 a 2 días hábiles, según la disponibilidad de las piezas.",
  },
  {
    title: "Tiempos de entrega",
    text: "Ciudades principales: 2 a 5 días hábiles. Resto del país: 4 a 8 días hábiles. Los plazos inician una vez el pedido sale de nuestro taller.",
  },
  {
    title: "Costo del envío",
    text: "Envío gratuito en pedidos de $200.000 COP o más. Para pedidos menores se aplica una tarifa fija de $12.000 COP.",
  },
  {
    title: "Seguimiento",
    text: "Al despachar tu pedido recibirás un correo con el número de guía y el enlace para rastrearlo en tiempo real.",
  },
];

const RETURN_STEPS = [
  "Escríbenos a soporte@esencial.store dentro de los primeros 8 días tras la entrega.",
  "Indica tu número de orden, el motivo y adjunta fotografías si aplica.",
  "Recibirás una guía de devolución sin costo para enviar la pieza.",
  "Una vez recibida e inspeccionada, emprendemos el cambio o reembolso.",
];

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">Envíos y devoluciones</h1>
        <p className="text-sm text-brand-muted mt-1">
          Envíos a toda Colombia con seguimiento en cada etapa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SHIPPING_INFO.map((item) => (
          <div key={item.title} className="bg-white border border-border/60 rounded-card p-6 space-y-1.5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">{item.title}</h2>
            <p className="text-sm text-brand-muted leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50/60 border border-border/40 rounded-card p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Devoluciones paso a paso
        </h2>
        <ol className="space-y-3">
          {RETURN_STEPS.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm text-brand-muted leading-relaxed">
              <span className="font-semibold text-brand-dark shrink-0">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-brand-muted border-t border-border/30 pt-3">
          Los productos en descuento o con rebaja pueden estar sujetos a condiciones especiales.
        </p>
      </div>
    </div>
  );
}