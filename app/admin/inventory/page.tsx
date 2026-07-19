import { PageTitle } from "@/components/common/PageTitle";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { Button } from "@/components/ui/Button";

// Datos mockeados enfocados puramente en control de stock (Alineado con tu data/products.json)
const MOCK_INVENTORY_DATA = [
  {
    id: "1",
    title: "Chaqueta Minimalista en Lana",
    slug: "chaqueta-minimalista-lana",
    sku: "JKT-LAN-001",
    category: "Prendas de Abrigo",
    price: 189000,
    stock: 5, // Bajo stock
    status: "low_stock"
  },
  {
    id: "2",
    title: "Camiseta Esencial Algodón Orgánico",
    slug: "camiseta-algodon-organico",
    sku: "TSH-ORG-002",
    category: "Básicos",
    price: 45000,
    stock: 12, // Stock saludable
    status: "in_stock"
  },
  {
    id: "3",
    title: "Pantalón Sastrero Moderno",
    slug: "pantalon-sastrero-moderno",
    sku: "PNT-SAS-003",
    category: "Pantalones",
    price: 160000,
    stock: 0, // Agotado
    status: "out_of_stock"
  }
];

export default async function AdminInventoryPage() {
  // En el futuro consumirás esto directamente de tu capa de datos o servicios.

  return (
    <div className="space-y-8">
      {/* ENCABEZADO CON ACCIONES OPERATIVAS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle 
          title="Control de Inventario" 
          subtitle="Monitoreo físico de existencias, códigos SKU y alertas de reabastecimiento crítico." 
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs">
            Imprimir etiquetas SKU
          </Button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN DE INVENTARIO RÁPIDO */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Total Ítems Únicos</span>
          <span className="text-xl font-semibold text-brand-dark">{MOCK_INVENTORY_DATA.length}</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Bajo Stock (&lt; 6)</span>
          <span className="text-xl font-semibold text-neutral-700">1</span>
        </div>
        <div className="bg-white border border-border/60 rounded-card p-4 flex items-center justify-between shadow-subtle">
          <span className="text-xs font-medium text-brand-muted uppercase">Agotados</span>
          <span className="text-xl font-semibold text-brand-dark">1</span>
        </div>
      </section>

      {/* CONTENEDOR DE LA TABLA OPERATIVA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {/* Delegamos el renderizado interactivo a tu componente atómico InventoryTable */}
        <InventoryTable products={MOCK_INVENTORY_DATA} />
      </section>
    </div>
  );
}