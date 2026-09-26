import { Leaf, RefreshCw, Ruler, Truck } from "lucide-react";

const GUARANTEES = [
  {
    icon: Truck,
    title: "Envío gratis",
    description: "En pedidos superiores a $200.000. Entrega de 2 a 5 días hábiles.",
  },
  {
    icon: RefreshCw,
    title: "30 días para cambiar",
    description: "Prueba la prenda en casa. Si no te convence, la cambiamos sin costo.",
  },
  {
    icon: Leaf,
    title: "Tejidos responsables",
    description: "Algodón orgánico, lana rastreable y cuero de curtido vegetal.",
  },
  {
    icon: Ruler,
    title: "Guía de tallas real",
    description: "Medidas en centímetros de cada prenda, no solo letras y números.",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-brand-light/60">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GUARANTEES.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-dark shadow-subtle">
                <item.icon className="h-4 w-4" />
              </span>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
                  {item.title}
                </p>
                <p className="text-xs text-brand-muted leading-relaxed">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
