import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CONFIG } from "@/constants/config";

const HERO_IMAGES = {
  main: "https://cdn.stocksnap.io/img-thumbs/960w/2OGDPAVS48.jpg",
  top: "https://cdn.stocksnap.io/img-thumbs/960w/6MFQR1VDEJ.jpg",
  bottom: "https://cdn.stocksnap.io/img-thumbs/960w/NSFAPOC1RZ.jpg",
};

export function HeroSection({ productCount }: { productCount: number }) {
  return (
    <section className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-7 order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-brand-light px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-dark">
            <Sparkles className="h-3 w-3 text-brand-accent" />
            Colección 2026
          </span>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight text-brand-dark">
              Ropa que dura
              <br />
              más que una
              <span className="text-brand-accent"> temporada</span>
            </h1>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed max-w-md">
              {productCount} piezas para armar un armario corto y útil: algodón orgánico,
              lana merina, lino y cuero curtido. Sin estridencias, sin tendencias pasajeras
              y sin compras que terminan en el cajón.
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
              href="/lookbook"
              className="inline-flex h-11 items-center rounded-button border border-border bg-white px-6 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-light"
            >
              Ver lookbook
            </Link>
          </div>

          <dl className="grid grid-cols-3 gap-4 pt-2 max-w-md">
            {[
              { label: "Colecciones", value: "09" },
              { label: "Cambios", value: "30 días" },
              { label: "Envío", value: "Gratis +200k" },
            ].map((item) => (
              <div key={item.label} className="border-l border-border pl-3">
                <dt className="text-[10px] uppercase tracking-wider text-brand-muted">
                  {item.label}
                </dt>
                <dd className="text-sm font-medium text-brand-dark">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="order-1 lg:order-2 grid grid-cols-5 grid-rows-2 gap-3 sm:gap-4">
          <div className="col-span-3 row-span-2 relative aspect-[3/4] overflow-hidden rounded-card bg-neutral-100">
            <Image
              src={HERO_IMAGES.main}
              alt="Perchero con ropa de la colección Esencial"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 60vw"
              className="object-cover object-center"
            />
            <span className="absolute left-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-wider text-brand-dark">
              {productCount} piezas activas
            </span>
          </div>

          <div className="col-span-2 row-span-1 relative aspect-[16/9] overflow-hidden rounded-card bg-neutral-100">
            <Image
              src={HERO_IMAGES.top}
              alt="Detalle minimalista de una silueta"
              fill
              priority
              sizes="(min-width: 1024px) 28vw, 40vw"
              className="object-cover object-center"
            />
          </div>

          <div className="col-span-2 row-span-1 relative aspect-[16/9] overflow-hidden rounded-card bg-neutral-100">
            <Image
              src={HERO_IMAGES.bottom}
              alt="Textiles naturales del taller"
              fill
              priority
              sizes="(min-width: 1024px) 28vw, 40vw"
              className="object-cover object-center"
            />
            <span className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/45 to-transparent">
              <span className="text-[10px] uppercase tracking-wider text-white">
                {CONFIG.site.currency === "COP" ? "Envíos a toda Colombia" : "Envíos nacionales"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
