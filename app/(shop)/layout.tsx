import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ShopDataProvider } from "../components/providers/ShopDataProvider";
import type { Metadata } from "next";

/* Sin `title` a propósito. Un layout que define el título como string anula el
   `template` del layout raíz, y todas las páginas de la tienda acababan
   mostrándose como "Carrito de compras" en vez de "Esencial - Carrito de
   compras". Aquí solo va la descripción. */
export const metadata: Metadata = {
  description:
    "Ropa atemporal, minimalismo funcional y piezas confeccionadas de forma consciente. Envíos a toda Colombia.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ShopDataProvider>
        <Navbar />
        {/* pt-24 separa el contenido del Navbar fixed */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {children}
        </main>
        <Footer />
      </ShopDataProvider>
    </div>
  );
}