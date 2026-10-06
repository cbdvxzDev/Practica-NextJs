// app/lib/backend.ts
// Ayudante server-side del BFF de autenticación.
//
// Las rutas /api/auth/* de Next tienen dos modos:
//  - Sin NEXT_PUBLIC_API_URL (desarrollo y tests E2E): gestión local contra la
//    mini base de datos de Next, tal y como siempre.
//  - Con NEXT_PUBLIC_API_URL (Spring Boot): el BFF solo hace de pasarela:
//    reenvía la petición al backend, y en login/registro firma además la
//    cookie httpOnly que `proxy.ts` verifica para servir /admin.
//
// El cliente siempre se queda con el token que devuelve el backend (un JWT de
// Spring) en localStorage para enviarlo como `Authorization: Bearer`.

import { apiUrl, hasRemoteApi } from "@/lib/api-url";
import type { AuthUser } from "@/services/auth.service";

/** true cuando los endpoints de auth deben reenviarse al backend Spring. */
export function backendEnabled(): boolean {
  return hasRemoteApi();
}

export interface BackendResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Reenvía una petición al backend y devuelve status + JSON.
 * Nunca lanza: si el backend no contesta se devuelve un 502 legible, para que
 * el formulario muestre un mensaje en vez de romper con un error sin capturar.
 */
export async function forwardAuth(
  path: string,
  init?: RequestInit
): Promise<BackendResult> {
  try {
    const res = await fetch(apiUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body };
  } catch {
    return {
      status: 502,
      body: { message: "No se pudo conectar con el servidor. Inténtalo de nuevo." },
    };
  }
}

/** Mensaje de error legible desde el cuerpo de una respuesta del backend. */
export function backendMessage(result: BackendResult, fallback: string): string {
  const message = result.body?.message;
  return typeof message === "string" && message.length > 0 ? message : fallback;
}

/**
 * Normaliza el usuario que devuelve Spring al shape que consume el cliente
 * (`AuthUser`). El rol ya llega en minúsculas desde el backend, pero aquí se
 * fuerza igualmente por si aparece un token con el rol en mayúsculas.
 */
export function normalizeUser(raw: unknown): AuthUser {
  const user = (raw ?? {}) as Record<string, unknown>;
  const rawRole = typeof user.role === "string" ? user.role.toLowerCase() : "customer";
  const role = rawRole === "admin" || rawRole === "support" ? rawRole : "customer";
  return {
    id: String(user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role,
    ...(typeof user.avatarUrl === "string" && user.avatarUrl
      ? { avatarUrl: user.avatarUrl }
      : {}),
  };
}
