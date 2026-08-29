"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

// Estructura de tipado estricta para el producto
export interface ProductFormData {
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  description: string;
  images: string[];
  sizes: string[];
  imageUrl: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories?: { id: string; label: string }[];
  onSubmit?: (data: ProductFormData) => void;
  isEdit?: boolean;
  className?: string;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

export function ProductForm({
  initialData,
  categories = [],
  onSubmit = () => undefined,
  className,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Estado inicial unificado
  const [formData, setFormData] = React.useState<ProductFormData>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || undefined,
    category: initialData?.category || categories[0]?.id || "",
    stock: initialData?.stock || 0,
    description: initialData?.description || "",
    images: initialData?.images || [],
    sizes: initialData?.sizes || [],
    imageUrl: initialData?.imageUrl || initialData?.images?.[0] || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const isSelected = prev.sizes.includes(size);
      const nextSizes = isSelected 
        ? prev.sizes.filter((s) => s !== size) 
        : [...prev.sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simular latencia de red premium antes del callback operativo
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      
      {/* COLUMNA PRINCIPAL (INFORMACIÓN DEL PRODUCTO) */}
      <div className="md:col-span-2 space-y-5 bg-white p-6 border border-border/40 rounded-card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
          Detalles de la pieza
        </h3>

        {/* NOMBRE */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium text-brand-dark">Nombre del producto</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="ej. Abrigo de Lana Atemporal"
            className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="description" className="text-xs font-medium text-brand-dark">Descripción narrativa</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe la confección, el corte y los materiales..."
            className="p-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark resize-none leading-relaxed"
          />
        </div>

        {/* IMAGEN PRINCIPAL */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="imageUrl" className="text-xs font-medium text-brand-dark">URL de imagen principal</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
            className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
          />
          {formData.imageUrl && (
            <div className="mt-1 h-32 w-24 overflow-hidden rounded-button border border-border/40 bg-neutral-50">
              {/* Vista previa rápida de la imagen ingresada */}
              <img src={formData.imageUrl} alt="Vista previa" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA LATERAL (LOGÍSTICA, PRECIOS Y VARIANTES) */}
      <div className="space-y-6">
        
        {/* BLOQUE COMERCIAL */}
        <div className="bg-white p-6 border border-border/40 rounded-card space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
            Estructura comercial
          </h3>

          {/* CATEGORÍA */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="category" className="text-xs font-medium text-brand-dark">Categoría de colección</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* PRECIO ACTUAL Y ORIGINAL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="price" className="text-xs font-medium text-brand-dark">Precio venta</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                required
                value={formData.price || ""}
                onChange={handleChange}
                className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="originalPrice" className="text-xs font-medium text-brand-muted">Precio original</label>
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                value={formData.originalPrice || ""}
                onChange={handleChange}
                placeholder="Opcional"
                className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
              />
            </div>
          </div>

          {/* INVENTARIO / STOCK */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="stock" className="text-xs font-medium text-brand-dark">Unidades disponibles en bodega</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              required
              value={formData.stock || ""}
              onChange={handleChange}
              className="h-10 px-3 text-xs border border-border/60 rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark"
            />
          </div>
        </div>

        {/* BLOQUE VARIANTES (TALLAS) */}
        <div className="bg-white p-6 border border-border/40 rounded-card space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
            Tallas disponibles
          </h3>
          <div className="grid grid-cols-5 gap-1.5">
            {AVAILABLE_SIZES.map((size) => {
              const isSelected = formData.sizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={cn(
                    "h-9 text-xs font-medium rounded-button border transition-all focus:outline-none",
                    isSelected
                      ? "border-brand-dark bg-brand-dark text-white font-semibold"
                      : "border-border/60 text-brand-dark hover:bg-brand-light"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN ACCESIBLE */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-xs font-semibold uppercase tracking-wider shadow-subtle"
        >
          {isSubmitting ? "Guardando cambios..." : "Guardar Producto"}
        </Button>
      </div>
    </form>
  );
}