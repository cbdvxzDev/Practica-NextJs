"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { CategoryService } from "@/services/category.service";

export default function AdminEditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [category, setCategory] = React.useState<{ name: string; slug: string; description: string; imageUrl: string } | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    CategoryService.getById(id)
      .then((c) =>
        setCategory({
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          imageUrl: c.imageUrl ?? "",
        })
      )
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar la categoría."));
  }, [id]);

  const handleSubmit = async (data: { name: string; slug: string; description: string; imageUrl: string }) => {
    try {
      await CategoryService.update(id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
      });
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la categoría.");
    }
  };

  if (error && !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-6xl font-black text-stone-200">404</p>
        <p className="text-xl font-semibold text-stone-900">Categoría no encontrada</p>
        <p className="text-xs text-stone-400 max-w-xs">{error}</p>
        <Link
          href="/admin/categories"
          className="text-sm font-semibold text-stone-700 underline underline-offset-4"
        >
          ← Volver a categorías
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto animate-pulse">
        <div className="h-3 bg-neutral-100 rounded w-40" />
        <div className="h-6 bg-neutral-100 rounded w-64" />
        <div className="h-64 bg-neutral-100 rounded-card" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
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

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <section className="pt-2">
        <CategoryForm initialData={category} onSubmit={handleSubmit} />
      </section>
    </div>
  );
}