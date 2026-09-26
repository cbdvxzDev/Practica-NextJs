"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/constants/config";
import { Button } from "../ui/Button";

export interface ProductFormData {
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  description: string;
  images: string[];
  sizes: string[];
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  categories: { id: string; label: string }[];
  onSubmit: (data: ProductFormData) => void;
  className?: string;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

export function ProductForm({ initialData, categories, onSubmit, className }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [skuError, setSkuError] = React.useState("");
  const [imageError, setImageError] = React.useState("");

  const [formData, setFormData] = React.useState<ProductFormData>({
    sku: initialData?.sku || "",
    name: initialData?.name || "",
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || undefined,
    category: initialData?.category || categories[0]?.id || "",
    stock: initialData?.stock || 0,
    description: initialData?.description || "",
    images: initialData?.images || [],
    sizes: initialData?.sizes || [],
  });

  const primaryImage = formData.images[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
    if (name === "sku") setSkuError("");
  };

  /**
   * Las fotografías se referencian por URL (StockSnap CC0 por defecto): la
   * primera línea es la foto principal y las siguientes son miniaturas
   * adicionales de la galería.
   */
  const handleImagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, images: lines }));
    setImageError("");
  };

  const validateImages = (): boolean => {
    if (formData.images.some((src) => !/^https?:\/\//i.test(src))) {
      setImageError("Cada fotografía debe ser una URL completa que empiece por http:// o https://");
      return false;
    }
    return true;
  };

  const handleSizeToggle = (size: string) => {
    setFormData((prev) => {
      const isSelected = prev.sizes.includes(size);
      const nextSizes = isSelected ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  const validateSku = (): boolean => {
    const skuPattern = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
    if (!formData.sku.trim()) {
      setSkuError("El SKU es obligatorio.");
      return false;
    }
    if (!skuPattern.test(formData.sku)) {
      setSkuError("Formato inválido. Usa mayúsculas, números y guiones (ej. TSH-BLK-001).");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSku()) return;
    if (!validateImages()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      <div className="md:col-span-2 space-y-5 bg-white p-6 border border-border/40 rounded-card">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
          Detalles de la pieza
        </h3>

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-col space-y-1.5 flex-1">
            <label htmlFor="images" className="text-xs font-medium text-brand-dark">
              Fotografías <span className="text-brand-muted font-normal normal-case">(una URL por línea, la primera es la principal)</span>
            </label>
            <textarea
              id="images"
              name="images"
              rows={3}
              value={formData.images.join("\n")}
              onChange={handleImagesChange}
              placeholder={"https://cdn.stocksnap.io/img-thumbs/960w/ABCD1234EF.jpg"}
              className={cn(
                "p-3 text-xs border rounded-button bg-white focus:outline-none focus:ring-1 text-brand-dark font-mono leading-relaxed",
                imageError ? "border-red-400 focus:ring-red-400" : "border-border/60 focus:ring-brand-dark"
              )}
            />
            {imageError
              ? <p className="text-[11px] text-red-600">{imageError}</p>
              : <p className="text-[11px] text-brand-muted">Sin fotografía se usará una imagen neutra de respaldo.</p>}
          </div>

          <div className="w-full sm:w-32 flex-shrink-0">
            <span className="block text-xs font-medium text-brand-dark mb-1.5">Vista previa</span>
            <div className="aspect-[3/4] w-full overflow-hidden rounded-button bg-neutral-100 border border-border/60 relative">
              <Image
                src={primaryImage || CONFIG.images.placeholder}
                alt="Vista previa de la fotografía"
                fill
                sizes="128px"
                className="object-cover object-center"
                unoptimized={!primaryImage}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 border border-border/40 rounded-card space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-dark border-b border-border/30 pb-3">
            Identificación y comercial
          </h3>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor="sku" className="text-xs font-medium text-brand-dark">
              SKU <span className="text-brand-muted font-normal normal-case">(código único de inventario)</span>
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              value={formData.sku}
              onChange={handleChange}
              placeholder="ej. TSH-BLK-001"
              className={cn(
                "h-10 px-3 text-xs font-mono uppercase border rounded-button bg-white focus:outline-none focus:ring-1 focus:ring-brand-dark text-brand-dark",
                skuError ? "border-red-400 focus:ring-red-400" : "border-border/60"
              )}
            />
            {skuError && <p className="text-[11px] text-red-600">{skuError}</p>}
          </div>

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
                    isSelected ? "border-brand-dark bg-brand-dark text-white font-semibold" : "border-border/60 text-brand-dark hover:bg-brand-light"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-xs font-semibold uppercase tracking-wider shadow-subtle">
          {isSubmitting ? "Guardando cambios..." : "Guardar Producto"}
        </Button>
      </div>
    </form>
  );
}