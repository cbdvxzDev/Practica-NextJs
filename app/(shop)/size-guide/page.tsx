import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CLOTHING_SIZES,
  FIT_NOTES,
  MEASURING_TIPS,
  SHOE_SIZES,
} from "@/constants/sizeGuide";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Medidas en centímetros de prendas y calzado de Esencial, con consejos para medirte y elegir tu talla sin dudas.",
};

export default function SizeGuidePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-medium tracking-tight text-brand-dark">
          Guía de tallas
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Todas las medidas están en centímetros y se refieren al cuerpo, no a la prenda. Si
          sigues entre dos tallas, escríbenos y te ayudamos a decidir.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Prendas
        </h2>

        <div className="overflow-x-auto border border-border/60 rounded-card bg-white">
          <table className="w-full min-w-[420px] text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-brand-dark">
                <th scope="col" className="px-4 py-3 text-left font-semibold">Talla</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Pecho (cm)</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Cintura (cm)</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">Cadera (cm)</th>
              </tr>
            </thead>
            <tbody>
              {CLOTHING_SIZES.map((row) => (
                <tr key={row.size} className="border-t border-border/30 text-brand-muted">
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-semibold text-brand-dark uppercase"
                  >
                    {row.size}
                  </th>
                  <td className="px-4 py-3">{row.chest}</td>
                  <td className="px-4 py-3">{row.waist}</td>
                  <td className="px-4 py-3">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Calzado
        </h2>

        <div className="overflow-x-auto border border-border/60 rounded-card bg-white">
          <table className="w-full min-w-[420px] text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-brand-dark">
                <th scope="col" className="px-4 py-3 text-left font-semibold">Talla</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Largo del pie (cm)
                </th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">
                  Plantilla (cm)
                </th>
              </tr>
            </thead>
            <tbody>
              {SHOE_SIZES.map((row) => (
                <tr key={row.size} className="border-t border-border/30 text-brand-muted">
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-semibold text-brand-dark"
                  >
                    {row.size}
                  </th>
                  <td className="px-4 py-3">{row.foot}</td>
                  <td className="px-4 py-3">{row.insole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-brand-muted">
          Las botas Chelsea y las botas de canvas celestial miden medio número menos que las
          sneakers y el calzado formal del mismo número.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Cómo medirte
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MEASURING_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="border border-border/60 rounded-card bg-white p-5 space-y-1.5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
                {tip.title}
              </p>
              <p className="text-xs text-brand-muted leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50/60 border border-border/40 rounded-card p-6 space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Notas de ajuste
        </h2>
        <ul className="space-y-1.5 text-xs text-brand-muted leading-relaxed list-disc pl-4">
          {FIT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/products"
          className="inline-flex h-11 items-center gap-2 rounded-button bg-brand-dark px-6 text-sm font-medium text-white transition-colors hover:bg-brand-dark/90"
        >
          Ver el catálogo
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
  );
}
