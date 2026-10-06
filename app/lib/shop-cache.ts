// app/lib/shop-cache.ts
// Invalidación de las páginas prerenderizadas de la tienda.
//
// `/`, `/categories` y `/sitemap.xml` leen la capa de datos en el servidor y
// quedan congelados en el build. Cualquier alta o edición desde el panel pasa
// por estos route handlers, así que aquí se marcan para que Next los vuelva a
// renderizar en la siguiente visita.

import { revalidatePath } from "next/cache";

/** Rutas que se sirven prerenderizadas y dependen de productos/categorías. */
const SHOP_PATHS = ["/", "/categories", "/products", "/sitemap.xml"];

export function revalidateShop(): void {
  for (const path of SHOP_PATHS) {
    try {
      revalidatePath(path);
    } catch {
      // Fuera de un contexto con caché (tests, build) no hay nada que
      // invalidar: la página se renderiza en cada petición igualmente.
    }
  }
}
