import type { Metadata } from "next";
import { Navbar } from "../compents/layout/Navbar";
import { Footer } from "../compents/layout/Footer";

export const metadata: Metadata = {
  title: "NOVA | Compra todo lo que buscas",
  description: "Moda, belleza, accesorios y tecnología en un solo lugar.",
};

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-light">
      {/* cabecera global de la tienda */}
      <Navbar />

      {/* Contenedor principal con grid/márgenes uniformes en toda la app */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-28 md:pb-12 animate-fadeIn">
        {children}
      </main>

      {/* Pie de página global */}
      <Footer />
    </div>
  );
}