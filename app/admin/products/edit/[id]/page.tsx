"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { ProductForm, type ProductFormData } from "@/compents/forms/ProductForm";
import { useCatalogStore } from "@/store/catalog.store";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const updateProduct = useCatalogStore((state) => state.updateProduct);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const product = products.find((item) => item.id === params.id);
  const categoryOptions = categories.map((category) => ({ id: category.slug, label: category.name }));

  const handleSubmit = (data: ProductFormData) => {
    const category = categories.find((item) => item.slug === data.category) || categories[0];
    updateProduct(params.id, {
      title: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.originalPrice,
      images: data.imageUrl ? [data.imageUrl] : product?.images ?? [],
      category: { id: category.id, name: category.name, slug: category.slug },
      department: category.name as never,
      stock: data.stock,
    });
    router.push("/admin/products");
  };

  if (!hydrated) {
    return <div className="py-24 text-center text-sm text-brand-muted">Cargando…</div>;
  }

  if (!product) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center py-16">
        <PageTitle title="Producto no encontrado" description="El producto que intentas editar no existe o fue eliminado." />
        <Link href="/admin/products" className="text-xs font-medium text-brand-dark underline underline-offset-4">
          ← Volver al listado de productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* NAVEGACIÓN DE RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/products" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver al listado de productos
        </Link>
        <PageTitle 
          title="Editar Producto" 
          description={`Modificando la información técnica y comercial de: ${product.title}`} 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO CON DATOS INICIALES */}
      <section className="pt-2">
        {/* Reutilizamos ProductForm pasándole los datos existentes para edición */}
        <ProductForm
          isEdit
          categories={categoryOptions}
          onSubmit={handleSubmit}
          initialData={{
            name: product.title,
            description: product.description,
            price: product.price,
            originalPrice: product.compareAtPrice,
            category: product.category.slug,
            stock: product.stock,
            imageUrl: product.images[0] ?? "",
          }}
        />
      </section>
    </div>
  );
}
