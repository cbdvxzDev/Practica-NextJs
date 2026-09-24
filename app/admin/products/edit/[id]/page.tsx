"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { ProductForm, type ProductFormData } from "@/components/forms/ProductForm";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const product = useProductStore((state) => state.products.find((p) => p.id === id));
  const updateProduct = useProductStore((state) => state.updateProduct);
  const categories = useCategoryStore((state) => state.categories);
  const [error, setError] = React.useState("");

  const categoryOptions = categories.map((c) => ({ id: c.id, label: c.name }));

  const handleSubmit = async (data: ProductFormData) => {
    setError("");
    const category = categories.find((c) => c.id === data.category);

    try {
      await updateProduct(id, {
        title: data.name,
        description: data.description,
        price: Number(data.price),
        compareAtPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        images: data.images?.length > 0 ? data.images : product?.images,
        category: {
          id: category?.id ?? data.category,
          name: category?.name ?? "",
          slug: category?.slug ?? "",
        },
        stock: Number(data.stock),
      });
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto.");
    }
  };

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-border pb-5 space-y-2">
        <Link href="/admin/products" className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1">
          ← Volver al listado de productos
        </Link>
        <PageTitle title="Editar Producto" description={`Modificando la información técnica y comercial de: ${product.title}`} />
      </div>

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <section className="pt-2">
        <ProductForm
          initialData={{
            sku: product.sku,
            name: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.compareAtPrice,
            category: product.category.id,
            stock: product.stock,
            images: product.images,
          }}
          categories={categoryOptions}
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  );
}