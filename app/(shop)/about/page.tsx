import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Esencial es un taller de ropa colombiana de diseño atemporal: series pequeñas, materiales nobles y prendas pensadas para combinarse entre sí.",
};

const VALUES = [
  {
    title: "Series pequeñas",
    description:
      "Producimos entre 40 y 120 unidades por referencia. Cuando se agota una talla no la reponemos con otra igual, sino con un ajuste nuevo que ya hemos probado.",
  },
  {
    title: "Materiales nobles",
    description:
      "Algodón orgánico certificado, lana merina rastreable, lino europeo y cuero de curtido vegetal. Nunca mezclamos fibras para abaratar el metro.",
  },
  {
    title: "Piezas que se combinan",
    description:
      "Cada referencia está probada con el resto del catálogo. Priorizamos un armario que se use antes que una colección que se quede parada en la silla.",
  },
  {
    title: "Precios transparentes",
    description:
      "Publicamos el precio final, incluidos impuestos y envío, antes del pago. Sin letra pequeña ni recargos en la última pantalla.",
  },
];

const TIMELINE = [
  {
    year: "2019",
    title: "Un taller en Medellín",
    description:
      "Empezamos con ocho referencias y dos máquinas. El objetivo nunca fue producir rápido, sino entender qué prendas se vuelven a usar.",
  },
  {
    year: "2022",
    title: "La primera colección completa",
    description:
      "Abrigos, camisas, pantalones y tejidos de punto juntos por primera vez, con la misma paleta de color de principio a fin.",
  },
  {
    year: "2024",
    title: "Tejido responsable",
    description:
      "Cambiamos la lana merina por proveedores con trazabilidad y el algodón a certificación orgánica en la mayoría del catálogo.",
  },
  {
    year: "2026",
    title: "Cuarenta y ocho referencias",
    description:
      "Nueve categorías, un solo taller y un almacén propio. Todo lo que ves en esta tienda está cortado y cosido aquí.",
  },
];

const STATS = [
  { value: "48", label: "Referencias activas" },
  { value: "09", label: "Categorías" },
  { value: "120", label: "Piezas por serie máxima" },
  { value: "100%", label: "Producción propia" },
];

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
            Manifiesto
          </span>

          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-brand-dark leading-tight">
            Vestir bien no debería requerir un armario enorme
          </h1>

          <div className="space-y-4 text-sm text-brand-muted leading-relaxed">
            <p>
              Esencial nació de una pregunta sencilla: ¿cuántas prendas necesita alguien
              para verse bien durante todo un año? Nuestra respuesta es corta: menos piezas,
              mejores materiales y un corte que aguante el uso diario.
            </p>
            <p>
              Diseñamos en Colombia, cosemos en series pequeñas y no repetimos la misma prenda
              cada temporada. Cada referencia se prueba durante seis meses antes de entrar al
              catálogo; si no mejora con el uso, se retira.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-button bg-brand-dark px-6 text-sm font-medium text-white transition-colors hover:bg-brand-dark/90"
            >
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-button border border-border bg-white px-6 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-light"
            >
              Escríbenos
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-neutral-100">
          <Image
            src="https://cdn.stocksnap.io/img-thumbs/960w/IA1A0DATOJ.jpg"
            alt="Interior del taller de Esencial"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-border py-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="border-l border-border pl-3">
            <p className="text-lg font-normal text-brand-dark">{stat.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-brand-dark">
          Cómo trabajamos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-card border border-border/60 bg-white p-6 space-y-2 shadow-subtle"
            >
              <h3 className="text-sm font-medium text-brand-dark">{value.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-brand-dark">
          Una historia por etapas
        </h2>

        <ol className="space-y-6">
          {TIMELINE.map((entry) => (
            <li
              key={entry.year}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-6 border-l border-border pl-4"
            >
              <p className="text-sm font-medium text-brand-accent">{entry.year}</p>
              <div className="sm:col-span-3 space-y-1">
                <h3 className="text-sm font-medium text-brand-dark">{entry.title}</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            src: "https://cdn.stocksnap.io/img-thumbs/960w/DC17RTS8K9.jpg",
            alt: "Máquina de coser en uso",
          },
          {
            src: "https://cdn.stocksnap.io/img-thumbs/960w/WDKYJMDRG7.jpg",
            alt: "Corte de tela sobre la mesa de trabajo",
          },
          {
            src: "https://cdn.stocksnap.io/img-thumbs/960w/X7QQCCGUTM.jpg",
            alt: "Prendas colgadas recién planchadas",
          },
        ].map((image) => (
          <div
            key={image.src}
            className="relative aspect-[3/4] overflow-hidden rounded-card bg-neutral-100"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </section>

      <section className="rounded-card border border-border bg-white p-6 sm:p-10 shadow-subtle space-y-3">
        <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-brand-dark">
          ¿Tienes una pregunta?
        </h2>
        <p className="text-sm text-brand-muted leading-relaxed max-w-2xl">
          Escríbenos a {CONFIG.site.contactEmail} y te respondemos en menos de 24 horas
          hábiles. También puedes pasar por el taller: atenderemos con gusto.
        </p>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-dark transition-colors hover:text-brand-accent"
        >
          Ir a contacto
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}
