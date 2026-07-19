"use client";

import Link from "next/link";
import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";
import { Badge } from "@/compents/ui/Badge";

const MOCK_ADMIN_CATEGORIES = [
  { id: "cat-1", name: "Prendas de Abrigo",  slug: "abrigo",     description: "Chaquetas, abrigos y camisas pesadas.",     productsCount: 14, isActive: true  },
  { id: "cat-2", name: "Básicos Esenciales", slug: "basicos",    description: "Camisetas y prendas de algodón orgánico.",   productsCount: 22, isActive: true  },
  { id: "cat-3", name: "Accesorios",         slug: "accesorios", description: "Complementos minimalistas y funcionales.",  productsCount: 9,  isActive: true  },
  { id: "cat-4", name: "Pantalones",         slug: "pantalones", description: "Cortes sastre y prendas de temporada.",     productsCount: 0,  isActive: false },
];

export default function AdminCategoriesPage() {
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_ADMIN_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-border/60 rounded-card p-5 shadow-subtle flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-brand-dark">{cat.name}</h3>
                <p className="text-xs text-brand-muted font-mono">/{cat.slug}</p>
              </div>
              <Badge variant={cat.isActive ? "default" : "secondary"}>
                {cat.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
              {cat.description}
            </p>

            <div className="flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-xs text-brand-muted">
                <span className="font-medium text-brand-dark">{cat.productsCount}</span> productos
              </span>
              <div className="flex items-center gap-2">
                <Link href={`/admin/categories/edit/${cat.id}`}>
                  <Button variant="ghost" className="h-7 px-3 text-xs">Editar</Button>
                </Link>
                <Button
                  variant="ghost"
                  className="h-7 px-3 text-xs text-red-500 hover:bg-red-50"
                  onClick={() => console.log("Eliminar categoría:", cat.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}