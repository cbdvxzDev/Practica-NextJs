import { PageTitle } from "../../compents/common/PageTitle";

const SHIPPING_METHODS = [
  { name: "Envío estándar", time: "2 a 5 días hábiles", cost: "Gratis en compras desde $150.000, o $12.000" },
  { name: "Ciudades principales", time: "1 a 3 días hábiles", cost: "Incluido en el envío estándar" },
  { name: "Zonas rurales o apartadas", time: "Hasta 8 días hábiles", cost: "Calculado según destino en el checkout" },
];

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PageTitle
        title="Envíos y devoluciones"
        subtitle="Todo lo que necesitas saber sobre cómo recibimos tu pedido y cómo gestionamos cambios o devoluciones."
      />

      <section className="space-y-4 rounded-card border border-border/60 bg-white p-6">
        <h2 className="text-lg font-medium text-brand-dark">Tiempos de entrega</h2>
        <div className="divide-y divide-border/60">
          {SHIPPING_METHODS.map((method) => (
            <div key={method.name} className="grid grid-cols-1 gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-3 sm:gap-4">
              <span className="text-sm font-medium text-brand-dark">{method.name}</span>
              <span className="text-sm text-brand-muted">{method.time}</span>
              <span className="text-sm text-brand-muted">{method.cost}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-card border border-border/60 bg-white p-6">
        <h2 className="text-lg font-medium text-brand-dark">Seguimiento de tu pedido</h2>
        <p className="text-sm leading-relaxed text-brand-muted">
          Una vez confirmada tu compra, recibirás un correo con el número de orden. Puedes consultar el estado de
          tu envío en cualquier momento desde la sección{" "}
          <a href="/track-order" className="underline underline-offset-4 hover:text-brand-dark">Rastrear pedido</a>,
          ingresando el número de orden y el correo utilizado en la compra.
        </p>
      </section>

      <section className="space-y-3 rounded-card border border-border/60 bg-white p-6">
        <h2 className="text-lg font-medium text-brand-dark">Cambios y devoluciones</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-muted">
          <li>Tienes 30 días calendario desde la entrega para solicitar un cambio o devolución.</li>
          <li>El producto debe estar en las mismas condiciones en que fue entregado, con etiquetas y empaque original.</li>
          <li>Si el producto presenta un defecto de fábrica, el cambio o devolución no tiene ningún costo.</li>
          <li>Para iniciar el proceso, escríbenos desde la página de Contacto indicando tu número de pedido.</li>
        </ul>
      </section>
    </div>
  );
}
