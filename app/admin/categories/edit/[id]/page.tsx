"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { PageTitle } from "@/compents/common/PageTitle";
import { CategoryForm, type CategoryFormData } from "@/compents/forms/CategoryForm";
import { useCatalogStore } from "@/store/catalog.store";

export default function AdminEditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const categories = useCatalogStore((state) => state.categories);
  const updateCategory = useCatalogStore((state) => state.updateCategory);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const category = categories.find((item) => item.id === params.id);

  const handleSubmit = (data: CategoryFormData) => {
    updateCategory(params.id, data);
    router.push("/admin/categories");
  };

  if (!hydrated) {
    return <div className="py-24 text-center text-sm text-brand-muted">Cargando…</div>;
  }

  if (!category) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto text-center py-16">
        <PageTitle title="Categoría no encontrada" description="La categoría que intentas editar no existe o fue eliminada." />
        <Link href="/admin/categories" className="text-xs font-medium text-brand-dark underline underline-offset-4">
          ← Volver a categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* NAVEGACIÓN DE RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/categories" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver a categorías
        </Link>
        <PageTitle 
          title="Editar Categoría" 
          description={`Modificando los metadatos y la descripción de la colección: ${category.name}`} 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO CON DATOS INICIALES */}
      <section className="pt-2">
        {/* Reutilizamos el formulario pasándole los datos existentes */}
        <CategoryForm initialData={category} isEdit onSubmit={handleSubmit} />
      </section>
    </div>
  );
}
