import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/compents/common/PageTitle";
import { CategoryForm } from "@/compents/forms/CategoryForm";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Base de datos simulada para la resolución en el servidor
interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

const MOCK_CATEGORIES_DB: Record<string, AdminCategory> = {
  "cat-1": {
    id: "cat-1",
    name: "Prendas de Abrigo",
    slug: "abrigo",
    description: "Chaquetas, abrigos y camisas pesadas diseñadas para el aislamiento térmico.",
    image: "/images/categories/abrigo.jpg"
  },
};

export default async function AdminEditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = MOCK_CATEGORIES_DB[id];

  // Si el ID solicitado no existe, disparamos el 404 nativo de Next.js
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* NAVEGACIÓN DE RETORNO Y ENCABEZADO */}
      <div className="border-b border-border pb-5 space-y-2">
        <Link 
          href="/admin/categories" 
          className="text-xs font-medium text-brand-muted hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          ← Volver a categorías
        </Link>
        <PageTitle 
          title="Editar Categoría" 
          description={`Modificando los metadatos y la descripción de la colección: ${category.name}`} 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO CON DATOS INICIALES */}
      <section className="pt-2">
        {/* Reutilizamos el formulario pasándole los datos existentes */}
        <CategoryForm initialData={category} isEdit={true} />
      </section>
    </div>
  );
}