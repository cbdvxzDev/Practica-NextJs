"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/compents/common/PageTitle";
import { CategoryForm, type CategoryFormData } from "@/compents/forms/CategoryForm";
import { useCatalogStore } from "@/store/catalog.store";

const DEFAULT_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop";

export default function AdminCreateCategoryPage() {
  const router = useRouter();
  const createCategory = useCatalogStore((state) => state.createCategory);

  const handleSubmit = (data: CategoryFormData) => {
    createCategory({
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: DEFAULT_CATEGORY_IMAGE,
    });
    router.push("/admin/categories");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/categories" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver a categorías
        </Link>
        <PageTitle 
          title="Nueva Categoría" 
          description="Define una nueva colección comercial, su identificador único y su identidad visual." 
        />
      </div>

      {/* CONTENEDOR DE FORMULARIO CLIENTE */}
      <section className="pt-2">
        <CategoryForm onSubmit={handleSubmit} />
      </section>
    </div>
  );
}