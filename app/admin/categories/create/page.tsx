"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { CategoryService } from "@/services/category.service";

export default function AdminCreateCategoryPage() {
  const router = useRouter();
  const [error, setError] = React.useState("");

  const handleSubmit = async (data: { name: string; slug: string; description: string; imageUrl: string }) => {
    try {
      await CategoryService.create({
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl || undefined,
      });
      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    }
  };

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
          title="Nueva Categoría"
          description="Define una nueva colección comercial, su identificador único y su identidad visual."
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <section className="pt-2">
        <CategoryForm onSubmit={handleSubmit} />
      </section>
    </div>
  );
}