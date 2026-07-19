import Link from "next/link";
import { PageTitle } from "@/components/common/PageTitle";
import { ProductForm } from "@/components/forms/ProductForm";

export default function AdminCreateProductPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* NAVEGACIÓN DE RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/products" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver al listado de productos
        </Link>
        <PageTitle 
          title="Nuevo Producto" 
          subtitle="Registra una nueva pieza en el catálogo global de la plataforma." 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO MAESTRO */}
      <section className="pt-2">
        {/* Delegamos la lógica interactiva al formulario atómico */}
        <ProductForm />
      </section>
    </div>
  );
}