// app/lib/server-api.ts
//
// Catálogo para server components (portada, categorías, ficha de producto) y
// el sitemap.
//
// Dos modos, el mismo criterio que en app/lib/api-url.ts:
//  - Con NEXT_PUBLIC_API_URL (Spring): fetch al backend con `revalidate`, para
//    que las páginas prerenderizadas se refresquen solas (ISR) sin esperar al
//    siguiente deploy.
//  - Sin ella (desarrollo y tests E2E): la mini base de datos de Next, tal y
//    como hasta ahora.
//
// Si el backend no contesta (dormido en el free tier, caído), la página no se
// rompe: se sirve el contenido local y el siguiente reintento de revalidación
// vuelve a probar con el backend.

import { readCollection } from "@/lib/db";
import { apiUrl, hasRemoteApi } from "@/lib/api-url";
import type { DbCategory, DbProduct } from "@/types/db";

/** Segundos entre revalidaciones ISR de las páginas del catálogo. */
export const SHOP_REVALIDATE = 60;

async function fetchRemoteList<T>(path: string, revalidate: number): Promise<T[] | null> {
  if (!hasRemoteApi()) return null;

  try {
    const res = await fetch(apiUrl(path), { next: { revalidate } });
    if (!res.ok) return null;

    const body = (await res.json()) as { data?: T[] };
    return Array.isArray(body.data) ? body.data : null;
  } catch {
    return null;
  }
}

/** Productos del catálogo público (la tienda filtra los inactivos donde hace falta). */
export async function getShopProducts(revalidate = SHOP_REVALIDATE): Promise<DbProduct[]> {
  const remote = await fetchRemoteList<DbProduct>("/api/products", revalidate);
  return remote ?? readCollection<DbProduct>("products");
}

/** Colecciones del catálogo. */
export async function getShopCategories(revalidate = SHOP_REVALIDATE): Promise<DbCategory[]> {
  const remote = await fetchRemoteList<DbCategory>("/api/categories", revalidate);
  return remote ?? readCollection<DbCategory>("categories");
}
