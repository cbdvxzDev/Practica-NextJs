import { CONFIG } from "@/constants/config";
import { getProductDetails } from "@/constants/productInfo";
import type { DbProduct } from "@/types/db";

interface ProductDetailsProps {
  product: DbProduct;
}

/** Ficha técnica: composición, cuidados, medidas y envío. */
export function ProductDetails({ product }: ProductDetailsProps) {
  const { fabric, care } = getProductDetails(product);
  const isOnSale = typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discount = isOnSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const specs = [
    { label: "Referencia", value: product.sku },
    { label: "Categoría", value: product.category.name },
    { label: "Composición", value: fabric },
    { label: "Tallas", value: product.sizes.length > 0 ? product.sizes.join(" · ") : "Talla única" },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Detalles
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-2"
            >
              <dt className="text-brand-muted">{spec.label}</dt>
              <dd className="text-brand-dark text-right">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          Cuidados
        </h2>
        <ul className="space-y-1.5 text-xs text-brand-muted leading-relaxed list-disc pl-4">
          {care.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {discount > 0 && (
        <section className="border border-brand-accent/30 bg-brand-light/50 rounded-card p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
            {discount}% de descuento
          </p>
          <p className="text-xs text-brand-muted leading-relaxed">
            Precio de referencia {product.compareAtPrice!.toLocaleString("es-CO")} {CONFIG.site.currency}.
            La promoción es válida hasta agotar existencias de la talla seleccionada.
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-brand-muted">
        <div className="border border-border/60 rounded-card p-4">
          <p className="font-semibold text-brand-dark">Envíos</p>
          <p className="mt-1 leading-relaxed">
            Gratis en pedidos superiores a $200.000. Entrega de 2 a 5 días hábiles.
          </p>
        </div>
        <div className="border border-border/60 rounded-card p-4">
          <p className="font-semibold text-brand-dark">Cambios</p>
          <p className="mt-1 leading-relaxed">
            30 días para cambiar o devolver, con la etiqueta de envío incluida.
          </p>
        </div>
        <div className="border border-border/60 rounded-card p-4">
          <p className="font-semibold text-brand-dark">Consultas</p>
          <p className="mt-1 leading-relaxed">
            Escríbenos a {CONFIG.site.contactEmail} y te ayudamos con tu talla.
          </p>
        </div>
      </section>
    </div>
  );
}
