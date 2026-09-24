"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/Button";
import { useProductStore } from "@/store/product.store";

export default function AdminProductsPage() {
  const products = useProductStore((state) => state.products);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Seguro que quieres eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle title="Productos" description="Administra el catálogo completo de la tienda." />
        <Link href="/admin/products/create">
          <Button variant="primary" className="h-10 text-sm">+ Nuevo producto</Button>
        </Link>
      </div>

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
              <Package className="h-6 w-6 text-brand-muted/60" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-brand-dark">Aún no hay productos</h3>
              <p className="text-xs text-brand-muted max-w-xs">
                Crea tu primer producto para empezar a construir el catálogo de la tienda.
              </p>
            </div>
            <Link href="/admin/products/create">
              <Button variant="primary" className="h-9 text-xs">+ Crear primer producto</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border/40 text-brand-muted text-xs font-medium uppercase tracking-wider">
                  <th className="py-3 px-6">Producto</th>
                  <th className="py-3 px-6">SKU</th>
                  <th className="py-3 px-6">Categoría</th>
                  <th className="py-3 px-6 text-right">Precio</th>
                  <th className="py-3 px-6 text-center">Stock</th>
                  <th className="py-3 px-6 text-center">Estado</th>
                  <th className="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-brand-dark">{product.title}</td>
                    <td className="py-4 px-6 text-brand-muted font-mono text-xs">{product.sku}</td>
                    <td className="py-4 px-6 text-brand-muted">{product.category.name}</td>
                    <td className="py-4 px-6 text-right font-medium text-brand-dark">${product.price.toLocaleString("es-CO")}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={product.stock === 0 ? "text-red-600 font-semibold" : "text-brand-dark"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        product.stock === 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {product.stock === 0 ? "Agotado" : "Disponible"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <Link href={`/admin/products/edit/${product.id}`} className="text-xs font-medium text-brand-dark hover:underline">Editar</Link>
                      <button onClick={() => handleDelete(product.id, product.title)} className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}