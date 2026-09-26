import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "El lookbook de Esencial: siluetas neutras, el taller, los percheros y los tejidos con los que armamos cada colección.",
};

interface Look {
  src: string;
  alt: string;
  span: string;
}

const LOOKS: Look[] = [
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/2OGDPAVS48.jpg",
    alt: "Perchero con ropa de la colección Esencial",
    span: "md:col-span-2 md:row-span-2 aspect-[3/4] md:aspect-auto",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/8QLY0AUTPF.jpg",
    alt: "Prendas colgadas en tonos neutros",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/XSM5N2TADD.jpg",
    alt: "Interior de la tienda con percheros",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/NSFAPOC1RZ.jpg",
    alt: "Textiles naturales apilados",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/INNJ1PW8LT.jpg",
    alt: "Silueta minimalista con abrigo largo",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/6MFQR1VDEJ.jpg",
    alt: "Detalle minimalista de una silueta",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/QO7AHBYWQE.jpg",
    alt: "Lino crudo con luz natural",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/VHPAZL4PNV.jpg",
    alt: "Punto grueso en tonos tierra",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/YIFUERVLUT.jpg",
    alt: "Tejido de algodón orgánico plegado",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/IA1A0DATOJ.jpg",
    alt: "Interior del taller de Esencial",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/DC17RTS8K9.jpg",
    alt: "Máquina de coser en uso",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/WDKYJMDRG7.jpg",
    alt: "Corte de tela sobre la mesa de trabajo",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/EXICURVOSX.jpg",
    alt: "Detalle de un look monocromático",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/UE4PDNKNCS.jpg",
    alt: "Bordado y costuras a la vista",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/0WHUTGE4PV.jpg",
    alt: "Hilo y agujas sobre superficie clara",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/EWLKIGUYVR.jpg",
    alt: "Boutique con percheros de ropa",
    span: "md:col-span-2 aspect-[16/9]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/DE3YKC6CUM.jpg",
    alt: "Percheros de ropa en tonos neutros",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/NQPGL2OX5H.jpg",
    alt: "Armario con prendas ordenadas",
    span: "aspect-[3/4]",
  },
  {
    src: "https://cdn.stocksnap.io/img-thumbs/960w/UNK2Z4WP7I.jpg",
    alt: "Silueta con texturas neutras",
    span: "aspect-[3/4]",
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
          Nueve colecciones pensadas para combinarse entre sí: el taller, los percheros, los
          tejidos y las siluetas con las que armamos cada referencia. Sin estridencias y sin
          tendencias pasajeras.
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-auto">
        {LOOKS.map((look) => (
          <figure
            key={look.src}
            className={`relative overflow-hidden rounded-card bg-neutral-100 ${look.span}`}
          >
            <Image
              src={look.src}
              alt={look.alt}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            <figcaption className="absolute left-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wider text-brand-dark">
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
