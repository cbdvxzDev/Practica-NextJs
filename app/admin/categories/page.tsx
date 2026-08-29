"use client";

import * as React from "react";
import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";
import { Badge } from "@/compents/ui/Badge";
import { useCatalogStore } from "@/store/catalog.store";

export default function AdminCategoriesPage() {
  const categories = useCatalogStore((state) => state.categories);
  const products = useCatalogStore((state) => state.products);
  const deleteCategory = useCatalogStore((state) => state.deleteCategory);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => setHydrated(true), []);

  const handleDelete = (id: string, name: string, count: number) => {
    if (count > 0) {
      window.alert(`No puedes eliminar "${name}" porque tiene ${count} producto(s) asociado(s). Reasigna o elimina esos productos primero.`);
      return;
    }
    if (window.confirm(`¿Eliminar la categoría "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Categorías"
          description="Administra las colecciones del catálogo, sus slugs e identidad visual."
        />
        <Link href="/admin/categories/create">
          <Button variant="primary" className="h-10 text-sm">+ Nueva categoría</Button>
        </Link>
      </div>

      {!hydrated ? (
        <div className="p-10 text-center text-sm text-brand-muted bg-white border border-border/60 rounded-card">
          Cargando…
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const productsCount = products.filter((product) => product.category.slug === cat.slug).length;
            return (
              <div
                key={cat.id}
                className="bg-white border border-border/60 rounded-card p-5 shadow-subtle flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-brand-dark">{cat.name}</h3>
                    <p className="text-xs text-brand-muted font-mono">/{cat.slug}</p>
                  </div>
                  <Badge variant="default">Activa</Badge>
                </div>

                <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-xs text-brand-muted">
                    <span className="font-medium text-brand-dark">{productsCount}</span> productos
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/categories/edit/${cat.id}`}>
                      <Button variant="ghost" className="h-7 px-3 text-xs">Editar</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="h-7 px-3 text-xs text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(cat.id, cat.name, productsCount)}
                    >
                      Eliminar
                    </Button>
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