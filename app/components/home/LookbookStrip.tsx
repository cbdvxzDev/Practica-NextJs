import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EDITORIAL_IMAGES, type EditorialImageKey } from "@/constants/editorialImages";

/* Miniaturas del lookbook. Las fotos salen del pipeline verificado, así que
   ninguna es un paisaje ni un estampado que se repita. */
const LOOKBOOK: { key: EditorialImageKey; alt: string }[] = [
  { key: "lookbook-01", alt: "Perchero de ropa clara" },
  { key: "lookbook-02", alt: "Silueta minimalista" },
  { key: "lookbook-03", alt: "Prendas colgadas en tonos neutros" },
  { key: "lookbook-04", alt: "Armario con piezas ordenadas" },
  { key: "lookbook-05", alt: "Detalle de un look monocromático" },
  { key: "lookbook-06", alt: "Boutique con percheros de ropa" },
];

export function LookbookStrip() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2 md:max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
            Lookbook
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-brand-dark">
            Así se ven las prendas fuera del catálogo
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed">
            Fotos de taller, escenas de compra y styling real. Sin retoque ni filtros:
            la ropa se prueba, se camina y se lava.
          </p>
        </div>

        <Link
          href="/lookbook"
          className="group inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-accent"
        >
          Ver lookbook completo
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {LOOKBOOK.map((shot) => (
          <figure
            key={shot.key}
            className="group relative aspect-[4/5] overflow-hidden rounded-card bg-neutral-100"
          >
            <Image
              src={EDITORIAL_IMAGES[shot.key]}
              alt={shot.alt}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
