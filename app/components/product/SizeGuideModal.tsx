"use client";

import * as React from "react";
import { CLOTHING_SIZES } from "@/constants/sizeGuide";

export interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-white rounded-card border border-border/60 shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 id="size-guide-title" className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
            Guía de tallas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-dark transition-colors"
            aria-label="Cerrar guía de tallas"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-[11px] leading-relaxed text-brand-muted">
            Las medidas están expresadas en centímetros sobre el cuerpo. Si estás entre dos tallas,
            recomendamos elegir la mayor para un ajuste relajado o la menor para un ajuste ajustado.
          </p>

          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-brand-dark">
                <th scope="col" className="px-3 py-2 text-left font-semibold">Talla</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Pecho (cm)</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Cintura (cm)</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold">Cadera (cm)</th>
              </tr>
            </thead>
            <tbody>
              {CLOTHING_SIZES.map((row) => (
                <tr key={row.size} className="border-t border-border/30 text-brand-muted">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-brand-dark uppercase">{row.size}</th>
                  <td className="px-3 py-2">{row.chest}</td>
                  <td className="px-3 py-2">{row.waist}</td>
                  <td className="px-3 py-2">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-[11px] text-neutral-400">
            ¿Tienes dudas?{" "}
            <a href="/size-guide" className="underline underline-offset-4 hover:text-brand-dark">
              Ver la guía completa
            </a>{" "}
            o escríbenos y te ayudamos a elegir tu talla.
          </p>
        </div>
      </div>
    </div>
  );
}
