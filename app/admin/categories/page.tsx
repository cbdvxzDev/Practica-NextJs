"use client";

import * as React from "react";
import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useProductStore } from "@/store/product.store";
import { useCategoryStore } from "@/store/category.store";

export default function AdminCategoriesPage() {
  const categories = useCategoryStore((state) => state.categories);
  const loading = useCategoryStore((state) => state.loading);
  const removeCategory = useCategoryStore((state) => state.removeCategory);
  const products = useProductStore((state) => state.products);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      await removeCategory(id);
    } catch {
      alert("No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle title="Categorías" description="Administra las colecciones del catálogo." />
        <Link href="/admin/categories/create">
          <Button variant="primary" className="h-10 text-sm">+ Nueva categoría</Button>
        </Link>
      </div>

      {loading && categories.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 bg-neutral-100 rounded-card" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-border/60 rounded-card shadow-subtle flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
            <FolderKanban className="h-6 w-6 text-brand-muted/60" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-brand-dark">Aún no hay categorías</h3>
            <p className="text-xs text-brand-muted max-w-xs">
              Crea tu primera categoría para organizar el catálogo de la tienda.
            </p>
          </div>
          <Link href="/admin/categories/create">
            <Button variant="primary" className="h-9 text-xs">+ Crear primera categoría</Button>
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category.id === cat.id).length;
            return (
              <div key={cat.id} className="bg-white border border-border/60 rounded-card p-5 shadow-subtle flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <Link href={`/categories/${cat.slug}`} className="text-sm font-semibold text-brand-dark hover:underline hover:underline-offset-4 transition-colors">
                      {cat.name}
                    </Link>
                    <p className="text-xs text-brand-muted font-mono">/{cat.slug}</p>
                  </div>
                  <Badge variant="default">Activa</Badge>
                </div>
                {cat.description && (
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-xs text-brand-muted">
                    <span className="font-medium text-brand-dark">{count}</span> productos
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/categories/edit/${cat.id}`}
                      className="text-xs font-medium text-brand-dark hover:underline underline-offset-4 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-xs font-medium text-red-600 hover:underline underline-offset-4 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
