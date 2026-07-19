import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/common/PageTitle";
import { ProductForm } from "@/components/forms/ProductForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Datos mockeados para simular la consulta en el servidor (reemplazar por llamadas a tu service)
const MOCK_PRODUCTS_DB: Record<string, any> = {
  "1": {
    id: "1",
    slug: "chaqueta-minimalista-lana",
    title: "Chaqueta Minimalista en Lana",
    description: "Confeccionada con lana de origen responsable, esta chaqueta presenta un corte estructurado contemporáneo.",
    price: 189000,
    category: "abrigo",
    stock: 5,
    isActive: true,
  },
};

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = MOCK_PRODUCTS_DB[id];

  // Si el identificador no coincide con ningún producto, disparamos el 404 nativo
  if (!product) {
    notFound();
  }

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
          title="Editar Producto" 
          subtitle={`Modificando la información técnica y comercial de: ${product.title}`} 
        />
      </div>

      {/* CONTENEDOR DEL FORMULARIO CON DATOS INICIALES */}
      <section className="pt-2">
        {/* Reutilizamos ProductForm pasándole los datos existentes para edición */}
        <ProductForm initialData={product} isEdit={true} />
      </section>
    </div>
  );
}