"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { ProductForm, type ProductFormData } from "@/compents/forms/ProductForm";
import { useCatalogStore } from "@/store/catalog.store";

export default function AdminCreateProductPage() {
  const router = useRouter();
  const categories = useCatalogStore((state) => state.categories);
  const createProduct = useCatalogStore((state) => state.createProduct);

  const categoryOptions = categories.map((category) => ({ id: category.slug, label: category.name }));

  const handleSubmit = (data: ProductFormData) => {
    const category = categories.find((item) => item.slug === data.category) || categories[0];
    createProduct({
      title: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.originalPrice,
      images: data.imageUrl ? [data.imageUrl] : [],
      category: { id: category.id, name: category.name, slug: category.slug },
      department: category.name as never,
      stock: data.stock,
      isActive: true,
      rating: 0,
      reviews: 0,
    });
    router.push("/admin/products");
  };

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
          title="Nuevo Producto" 
          description="Registra una nueva pieza en el catálogo global de la plataforma." 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO MAESTRO */}
      <section className="pt-2">
        {/* Delegamos la lógica interactiva al formulario atómico */}
        <ProductForm categories={categoryOptions} onSubmit={handleSubmit} />
      </section>
    </div>
  );
}