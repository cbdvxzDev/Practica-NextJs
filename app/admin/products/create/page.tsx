"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { ProductForm, type ProductFormData } from "@/components/forms/ProductForm";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";
import { CONFIG } from "@/constants/config";

export default function AdminCreateProductPage() {
  const router = useRouter();
  const categories = useCategoryStore((state) => state.categories);
  const addProduct = useProductStore((state) => state.addProduct);
  const [error, setError] = React.useState("");

  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.name }));

  const handleSubmit = async (data: ProductFormData) => {
    setError("");
    const category = categories.find((c) => c.id === data.category);

    if (!category) {
      setError("No hay categorías cargadas. Recarga la página e inténtalo de nuevo.");
      return;
    }

    try {
      await addProduct({
        sku: data.sku,
        title: data.name,
        description: data.description,
        price: Number(data.price),
        compareAtPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        images: data.images.length > 0 ? data.images : [CONFIG.images.placeholder],
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        sizes: data.sizes,
        stock: Number(data.stock),
        isActive: true,
      });
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el producto.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-border pb-5 space-y-2">
        <Link href="/admin/products" className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1">
          ← Volver al listado de productos
        </Link>
        <PageTitle title="Nuevo Producto" description="Registra una nueva pieza en el catálogo global de la plataforma." />
      </div>

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <section className="pt-2">
        <ProductForm categories={categoryOptions} onSubmit={handleSubmit} />
      </section>
    </div>
  );
}