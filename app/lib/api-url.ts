// app/lib/api-url.ts

import { CONFIG } from "@/constants/config";

/**
 * Base del backend Spring (p. ej. http://localhost:8080).
 *
 * Cuando NEXT_PUBLIC_API_URL no está definida la base es la ruta relativa
 * `/api`, es decir: la mini API de Next de este mismo origen. En ese modo
 * `apiUrl()` devuelve las rutas tal cual y nada cambia (desarrollo local y
 * tests E2E siguen exactamente igual que antes).
 */
function remoteBase(): string | null {
  // En el servidor (route handlers, server components) además leemos
  // API_URL para poder cambiar de backend sin reconstruir el cliente.
  const raw =
    (typeof process !== "undefined" &&
      (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)) ||
    CONFIG.api.baseUrl;

  const base = raw.replace(/\/$/, "");
  return /^https?:\/\//i.test(base) ? base : null;
}

/** true cuando hay un backend Spring remoto configurado. */
export function hasRemoteApi(): boolean {
  return remoteBase() !== null;
}

/**
 * Construye la URL de un endpoint del backend para los servicios que sí hablan
 * con Spring (productos, categorías, pedidos, usuarios/perfil).
 *
 * `apiUrl("/api/products")` → "http://localhost:8080/api/products" si hay
 * backend remoto, o "/api/products" (mini API de Next) si no lo hay.
 *
 * Ojo: auth, newsletter y contact NO usan este helper; esos endpoints viven en
 * Next (BFF de auth y formularios públicos) y siempre van a la misma origin.
 */
export function apiUrl(path: string): string {
  const base = remoteBase();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
