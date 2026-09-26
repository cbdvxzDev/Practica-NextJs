import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Mariana Restrepo",
    city: "Medellín",
    rating: 5,
    quote:
      "Pedí la camisa de lino y el pantalón recto. La guía de tallas era exacta, así que no necesité cambiar nada. Se ven bien con zapatos de cuero y con tenis.",
  },
  {
    name: "Julián Ospina",
    city: "Bogotá",
    rating: 5,
    quote:
      "Llevo tres temporadas comprando básicos acá. El algodón orgánico no se deforma ni se transparenta, que era mi problema con otras tiendas.",
  },
  {
    name: "Daniela Ferrer",
    city: "Cali",
    rating: 4,
    quote:
      "El blazer de tweed llegó tres días después y el empaque venía sin plástico de sobra. Detalle que parece poco, pero se nota.",
  },
];

export function Testimonials() {
  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-2xl text-center space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
          Testimonios
        </span>
        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-brand-dark">
          Lo que dicen quienes ya compraron
        </h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {TESTIMONIALS.map((item) => (
          <li
            key={item.name}
            className="flex h-full flex-col justify-between gap-5 rounded-card border border-border/60 bg-white p-6 shadow-subtle"
          >
            <div className="space-y-4">
              <Quote className="h-5 w-5 text-brand-accent" />
              <p className="text-sm text-brand-muted leading-relaxed">{item.quote}</p>
            </div>

            <div className="space-y-3 border-t border-border/40 pt-4">
              <div className="flex items-center gap-1" aria-label={`${item.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={
                      index < item.rating
                        ? "h-3.5 w-3.5 fill-brand-accent text-brand-accent"
                        : "h-3.5 w-3.5 text-neutral-300"
                    }
                  />
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
                {item.name}
              </p>
              <p className="text-[11px] text-brand-muted">{item.city}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
