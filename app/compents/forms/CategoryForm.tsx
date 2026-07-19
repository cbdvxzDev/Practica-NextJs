"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

export interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  className?: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  className,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
  });

  // Generador automático de Slugs limpios optimizados para URLs
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remueve acentos
      .replace(/[^a-z0-9 -]/g, "") // Remueve caracteres especiales inválidos
      .replace(/\s+/g, "-") // Reemplaza espacios por guiones
      .replace(/-+/g, "-"); // Remueve guiones duplicados
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      
      // Auto-completar el slug de forma inteligente si el usuario está modificando el nombre
      if (name === "name" && !initialData) {
        nextData.slug = generateSlug(value);
      }
      
      return nextData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular latencia de red premium para asegurar consistencia visual
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("max-w-xl bg-white p-6 border border-border/40 rounded-card space-y-5", className)}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
        Estructura de la Colección
      </h3>

      {/* NOMBRE DE LA CATEGORÍA */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium text-brand-dark">
          Nombre de categoría
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="ej. Básicos Esenciales o Prendas de Abrigo"
          className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
        />
      </div>

      {/* SLUG DINÁMICO */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="slug" className="text-xs font-medium text-brand-dark">
          Slug identificador (URL)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-[11px] font-mono text-brand-muted/60 select-none">
            /categories/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={formData.slug}
            onChange={handleChange}
            placeholder="basicos-esenciales"
            className="h-10 w-full pl-[84px] pr-3 text-xs font-mono border border-border/60 rounded-button bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
          />
        </div>
        <p className="text-[10px] text-brand-muted leading-tight">
          El identificador único se genera automáticamente basado en el nombre para cuidar el SEO estructural.
        </p>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="description" className="text-xs font-medium text-brand-dark">
          Descripción de colección
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Breve narrativa estética de las piezas agrupadas en esta sección..."
          className="p-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark resize-none leading-relaxed"
        />
      </div>

      {/* ACCIÓN PRINCIPAL */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 text-xs font-semibold uppercase tracking-wider"
        >
          {isSubmitting ? "Procesando..." : "Guardar Colección"}
        </Button>
      </div>
    </form>
  );
}