"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/compents/ui/Button";
import { PageTitle } from "@/compents/common/PageTitle";
import { ProductTable, type Product } from "@/compents/admin/ProductTable";
import { useCatalogStore } from "@/store/catalog.store";

export default function AdminProductsPage() {
  const router = useRouter();
  const products = useCatalogStore((state) => state.products);
  const categories = useCatalogStore((state) => state.categories);
  const deleteProduct = useCatalogStore((state) => state.deleteProduct);
  const [hydrated, setHydrated] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState("");

  React.useEffect(() => setHydrated(true), []);

  const filteredProducts = categoryFilter
    ? products.filter((product) => product.category.slug === categoryFilter)
    : products;

  const tableRows: Product[] = filteredProducts.map((product) => ({
    id: product.id,
    name: product.title,
    category: product.category.name,
    price: product.price,
    stock: product.stock,
    status: product.stock > 0 && product.isActive ? "activo" : "agotado",
  }));

  const handleDelete = (id: string) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (window.confirm(`¿Eliminar "${product.title}" del catálogo? Esta acción no se puede deshacer.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle
          title="Catálogo de Productos"
          description="Administra las piezas activas del catálogo, precios y disponibilidad."
        />
        <Link href="/admin/products/create">
          <Button variant="primary" className="h-10 text-sm">+ Nuevo producto</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-border/60 rounded-card p-4 shadow-subtle">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-brand-muted">Filtrar por categoría:</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-8 px-2 text-xs rounded-button border border-border bg-white text-brand-dark focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-brand-muted">
          Mostrando <span className="font-medium text-brand-dark">{hydrated ? tableRows.length : 0}</span> productos
        </div>
      </div>

      {!hydrated ? (
        <div className="p-10 text-center text-sm text-brand-muted bg-white border border-border/60 rounded-card">
          Cargando…
        </div>
      ) : (
        <ProductTable
          products={tableRows}
          onEdit={(id) => router.push(`/admin/products/edit/${id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}