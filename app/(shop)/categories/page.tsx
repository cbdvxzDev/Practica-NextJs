import Link from "next/link";
import { PageTitle } from "../../compents/common/PageTitle";

// Estructura de datos simulada alineada con tu directorio data/categories.json
const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Prendas de Abrigo",
    slug: "abrigo",
    description: "Chaquetas, abrigos y camisas pesadas confeccionadas para durar.",
    image: "/images/categories/abrigo.jpg",
    count: 14,
  },
  {
    id: "cat-2",
    name: "Básicos Esenciales",
    slug: "basicos",
    description: "Camisetas, sudaderas y prendas interiores de algodón orgánico superior.",
    image: "/images/categories/basicos.jpg",
    count: 22,
  },
  {
    id: "cat-3",
    name: "Accesorios",
    slug: "accesorios",
    description: "Complementos minimalistas diseñados bajo una estética funcional.",
    image: "/images/categories/accesorios.jpg",
    count: 9,
  },
];

export default async function CategoriesPage() {
  // En el futuro: const categories = await categoryService.getAll();

  return (
    <div className="space-y-10">
      {/* Encabezado limpio */}
      <div className="border-b border-border pb-5">
        <PageTitle 
          title="Categorías" 
          subtitle="Explora nuestras colecciones organizadas por su propósito y materialidad." 
        />
      </div>

      {/* Grid Uniforme de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_CATEGORIES.map((category) => (
          <Link 
            key={category.id} 
            href={`/categories/${category.slug}`}
            className="group block relative overflow-hidden bg-neutral-100 rounded-card border border-border/40 transition-all duration-300 hover:shadow-subtle"
          >
            {/* Contenedor de Imagen con Relación de Aspecto Fija (Tipo Retrato) */}
            <div className="aspect-[4/5] w-full relative bg-neutral-200 overflow-hidden">
              {/* Nota: En producción usarás el componente <Image /> de Next.js */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Capa de degradado sutil e invisible para mejorar contraste si la imagen es clara */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
            </div>

            {/* Información de la Categoría */}
            <div className="p-6 bg-white border-t border-border/40">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-medium text-brand-dark group-hover:text-brand-accent transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs font-medium text-brand-muted bg-brand-light px-2 py-1 rounded">
                  {category.count} piezas
                </span>
              </div>
              <p className="text-sm text-brand-muted line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}