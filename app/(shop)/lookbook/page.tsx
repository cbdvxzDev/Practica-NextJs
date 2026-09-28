import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EDITORIAL_IMAGES, type EditorialImageKey } from "@/constants/editorialImages";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "El lookbook de Esencial: siluetas neutras, percheros y tejidos con los que armamos cada colección.",
};

interface Look {
  key: EditorialImageKey;
  alt: string;
  span: string;
}

/* Las fotos salen del pipeline verificado (`app/constants/editorialImages.ts`):
   mismo filtro que el catálogo, sin paisajes y sin repetir ninguna. Los textos
   de aquí describen la prenda de la foto, no un lugar. */
const LOOKS: Look[] = [
  {
    key: "lookbook-01",
    alt: "Perchero con ropa de la colección Esencial",
    span: "md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto",
  },
  { key: "lookbook-02", alt: "Prendas colgadas en tonos neutros", span: "aspect-[4/5]" },
  { key: "lookbook-03", alt: "Armario con piezas ordenadas", span: "aspect-[4/5]" },
  { key: "lookbook-04", alt: "Silueta con abrigo largo", span: "aspect-[4/5]" },
  { key: "lookbook-05", alt: "Detalle de un look monocromático", span: "aspect-[4/5]" },
  { key: "lookbook-06", alt: "Punto grueso en tonos tierra", span: "aspect-[4/5]" },
  { key: "lookbook-07", alt: "Lino crudo con luz natural", span: "aspect-[4/5]" },
  { key: "lookbook-08", alt: "Tejido de algodón orgánico plegado", span: "aspect-[4/5]" },
  { key: "lookbook-09", alt: "Silueta minimalista con jersey", span: "aspect-[4/5]" },
  { key: "lookbook-10", alt: "Denim en tono crudo", span: "aspect-[4/5]" },
  { key: "lookbook-11", alt: "Conjunto de dos piezas en tonos neutros", span: "aspect-[4/5]" },
  {
    key: "lookbook-12",
    alt: "Boutique con percheros de ropa",
    span: "md:col-span-2 aspect-[4/5] md:aspect-auto",
  },
];

export default function LookbookPage() {
  return (
    <div className="space-y-12">
      <section className="max-w-2xl space-y-4">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
          Temporada 2026
        </span>

        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-brand-dark leading-tight">
          Lookbook
        </h1>

        <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
          Colecciones pensadas para combinarse entre sí: percheros, tejidos y siluetas con
          las que armamos cada referencia. Sin estridencias y sin tendencias pasajeras.
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-auto">
        {LOOKS.map((look) => (
          <figure
            key={look.key}
            className={`relative overflow-hidden rounded-card bg-neutral-100 ${look.span}`}
          >
            <Image
              src={EDITORIAL_IMAGES[look.key]}
              alt={look.alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <figcaption className="absolute left-3 bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wider text-brand-dark truncate">
              {look.alt}
            </figcaption>
          </figure>
        ))}
      </div>

      <section className="rounded-card border border-border bg-white p-6 sm:p-10 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-brand-dark">
            ¿Te gustó alguna silueta?
          </h2>
          <p className="text-sm text-brand-muted">
            Encuentra la prenda exacta dentro del catálogo.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-button bg-brand-dark px-6 text-sm font-medium text-white transition-colors hover:bg-brand-dark/90"
        >
          Ver el catálogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
