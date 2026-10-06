// proxy.ts
// Protección de rutas en el servidor, antes de renderizar.
//
// El guard de `app/admin/layout.tsx` vive en el cliente: sin esto, cualquiera
// que abriera /admin en una pestaña anónima recibiría el HTML del panel y solo
// después de hidratar vería el salto a /login. Aquí la sesión se valida en el
// servidor, con la cookie httpOnly que escribe /api/auth/login.
//
// Importa solo `session-token` y no `@/lib/auth` a propósito: `auth.ts` tira de
// la capa de datos y no queremos abrir el motor de archivos o el driver de
// Mongo en cada request que entre al panel.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session-token";

/** Roles con acceso al panel. Debe coincidir con app/admin/layout.tsx. */
const STAFF_ROLES = new Set(["admin", "support"]);

/** Rutas de cliente que exigen sesión (además de /admin). */
const AUTH_ROUTES = ["/checkout", "/profile"];

const matches = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isStaffRoute = matches(pathname, "/admin");
  const needsSession =
    isStaffRoute || AUTH_ROUTES.some((route) => matches(pathname, route));

  // El matcher ya acota las rutas, pero se comprueba aquí igualmente para que
  // ampliar el matcher sin tocar la lógica no deje nada sin proteger.
  if (!needsSession) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = verifyToken(token);

  // Sin sesión válida: al login, recordando a dónde quería ir.
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Con sesión pero sin rol de staff en una ruta del panel: fuera, a la tienda.
  if (isStaffRoute && !STAFF_ROLES.has(payload.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Panel + las dos zonas privadas del cliente. Acotar el matcher también evita
  // que la lógica de auth se ejecute sobre estáticos, /_next/image o /public.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/checkout",
    "/checkout/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
