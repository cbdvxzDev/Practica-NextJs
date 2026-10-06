// app/sitemap.ts
// Mapa del sitio para buscadores. Se genera desde el catálogo real, así que
// una referencia nueva aparece sola sin tocar este archivo.

import type { MetadataRoute } from "next";
import { getShopCategories, getShopProducts } from "@/lib/server-api";
import { CONFIG } from "@/constants/config";

// ISR: igual que la portada, sin esto el mapa del sitio se queda con el
// catálogo del build hasta el siguiente deploy.
export const revalidate = 3600;

/** Rutas estáticas de la tienda, con la frecuencia con que cambian. */
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/lookbook", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { path: "/shipping", changeFrequency: "yearly", priority: 0.3 },
  { path: "/size-guide", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = CONFIG.site.url;
  const now = new Date();

  const [allProducts, categories] = await Promise.all([
    getShopProducts(3600),
    getShopCategories(3600),
  ]);

  const products = allProducts
    .filter((p) => p.isActive)
    .map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryEntries = categories.map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const statics = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // /cart, /checkout, /perfil y /admin quedan fuera a propósito: son privadas
  // o no tienen sentido en un índice de búsqueda.
  return [...statics, ...categoryEntries, ...products];
}
