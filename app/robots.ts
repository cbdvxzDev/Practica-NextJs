// app/robots.ts
// Instrucciones para rastreadores.

import type { MetadataRoute } from "next";
import { CONFIG } from "@/constants/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // El panel, la API y las páginas de sesión no se indexan: no aportan
        // nada en un buscador y exponen rutas que no deberían estar públicas.
        disallow: ["/admin", "/api", "/cart", "/checkout", "/profile", "/login", "/register", "/wishlist"],
      },
    ],
    sitemap: `${CONFIG.site.url}/sitemap.xml`,
  };
}
