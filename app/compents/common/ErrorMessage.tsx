"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Algo salió mal",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div 
      className={cn(
        "flex flex-col p-4 border border-red-100 bg-red-50/50 rounded-card",
        className
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {/* ÍCONO DE ALERTA SUTIL */}
        <div className="flex-shrink-0 mt-0.5 text-red-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* CONTENIDO DEL ERROR */}
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-red-900 uppercase tracking-wide">
            {title}
          </h4>
          <p className="mt-1 text-[11px] text-red-800/80 leading-relaxed">
            {message}
          </p>
          
          {/* ACCIÓN DE REINTENTO */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-[11px] font-semibold text-red-900 underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}