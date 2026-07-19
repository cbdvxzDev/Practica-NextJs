import Link from "next/link";
import { PageTitle } from "@/components/common/PageTitle";
import { CategoryForm } from "@/components/forms/CategoryForm";

export default function AdminCreateCategoryPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/categories" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver a categorías
        </Link>
        <PageTitle 
          title="Nueva Categoría" 
          subtitle="Define una nueva colección comercial, su identificador único y su identidad visual." 
        />
      </div>

      {/* CONTENEDOR DE FORMULARIO CLIENTE */}
      <section className="pt-2">
        <CategoryForm />
      </section>
    </div>
  );
}