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

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = verifyToken(token);

  // Sin sesión válida: al login, recordando a dónde quería ir.
  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  // Con sesión pero sin rol de staff: fuera del panel, a la tienda.
  if (!STAFF_ROLES.has(payload.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Solo /admin. Acotar el matcher también evita que la lógica de auth se
  // ejecute sobre estáticos, /_next/image o las fotos de /public.
  matcher: ["/admin", "/admin/:path*"],
};
