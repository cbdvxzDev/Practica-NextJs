import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Scissors } from "lucide-react";

const STATS = [
  { value: "09", label: "Colecciones" },
  { value: "48", label: "Referencias" },
  { value: "06", label: "Talles por prenda" },
  { value: "30", label: "Días para cambio" },
];

export function EditorialSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
      <div className="relative aspect-[4/5] rounded-card overflow-hidden bg-neutral-100">
        <Image
          src="https://cdn.stocksnap.io/img-thumbs/960w/IA1A0DATOJ.jpg"
          alt="Interior del taller de Esencial"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="space-y-6">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
          <Scissors className="h-3.5 w-3.5" />
          Manifiesto
        </span>

        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-brand-dark leading-tight">
          Diseñamos en Colombia, cosemos en series pequeñas y no repetimos la misma
          prenda cada temporada.
        </h2>

        <div className="space-y-4 text-sm text-brand-muted leading-relaxed">
          <p>
            Esencial nació de una pregunta sencilla: ¿cuántas prendas necesita alguien
            para verse bien durante todo un año? Nuestra respuesta es corta — menos piezas,
            mejores materiales y un corte que aguante el uso diario.
          </p>
          <p>
            Cada referencia se prueba durante seis meses antes de entrar al catálogo. Si
            no mejora con el uso, se retira. Preferimos un armario que se pueda combinar
            entre sí antes que una colección que se quede parada en la silla.
          </p>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-l border-border pl-3">
              <dt className="text-[10px] uppercase tracking-wider text-brand-muted">
                {stat.label}
              </dt>
              <dd className="text-lg font-normal text-brand-dark">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <Link
          href="/about"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-accent"
        >
          Conoce nuestra historia
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
