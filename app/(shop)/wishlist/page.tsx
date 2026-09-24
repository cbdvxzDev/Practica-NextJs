"use client";

import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";
import { ProductGrid } from "../../compents/product/ProductGrid";
import { Button } from "../../compents/ui/Button";
import { useProductStore } from "../../store/product.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { useAuthStore } from "../../store/auth.store";

export default function WishlistPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const allProducts = useProductStore((state) => state.products);
  const wishlistIds = useWishlistStore((state) => state.items);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Inicia sesión para ver tu lista de deseos</h1>
          <p className="text-sm text-brand-muted max-w-sm mx-auto">
            Crea una cuenta o inicia sesión para guardar tus piezas favoritas y encontrarlas cuando quieras.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="primary" className="h-11 px-6">Iniciar sesión</Button></Link>
          <Link href="/register"><Button variant="outline" className="h-11 px-6">Crear cuenta</Button></Link>
        </div>
      </div>
    );
  }

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Tu lista de deseos está vacía</h1>
          <p className="text-sm text-brand-muted max-w-sm mx-auto">
            Guarda los artículos que te encantan para revisarlos más tarde.
          </p>
        </div>
        <Link href="/products"><Button variant="outline" className="h-11 px-6">Explorar productos</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="border-b border-border pb-5">
        <PageTitle
          title="Tu Lista de Deseos"
          description={`Tienes ${wishlistProducts.length} piezas guardadas en tu colección personal.`}
        />
      </div>
      <section className="pt-2">
        <ProductGrid products={wishlistProducts} />
      </section>
    </div>
  );
}