import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  // Escuchar la tecla 'Escape' para cerrar el modal de forma accesible
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* 1. FONDO TRASLÚCIDO CON DESENFOQUE SUTIL */}
      <div 
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* 2. CONTENEDOR CENTRAL DEL MODAL */}
      <div
        className={cn(
          "relative w-full max-w-md transform overflow-hidden rounded-card bg-white border border-border/50 p-6 shadow-modal transition-all animate-scaleIn z-10",
          className
        )}
      >
        {/* BOTÓN DISCRETO DE CIERRE (X) */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-button p-1.5 text-brand-muted hover:bg-brand-light hover:text-brand-dark transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ENCABEZADO */}
        <div className="space-y-1.5 pr-6">
          <h2 className="text-base font-medium tracking-tight text-brand-dark">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-brand-muted">
              {description}
            </p>
          )}
        </div>

        {/* CUERPO DE CONTENIDO */}
        <div className="mt-5 text-sm text-brand-dark">
          {children}
        </div>
      </div>
    </div>
  );
}