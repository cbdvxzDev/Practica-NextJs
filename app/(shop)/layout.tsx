import { Navbar } from "../compents/layout/Navbar";
import { Footer } from "../compents/layout/Footer";
import { ShopDataProvider } from "../compents/providers/ShopDataProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Esencial",
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