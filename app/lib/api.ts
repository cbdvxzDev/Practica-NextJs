// app/lib/api.ts
// Utilidades compartidas para los Route Handlers de la mini API.

import { NextRequest, NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "./auth";

/**
 * Envuelve un Route Handler y traduce excepciones de autenticación
 * a respuestas HTTP correctas (401/403/500).
 */
export function apiHandler<C>(
  fn: (request: NextRequest, context: C) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: C): Promise<NextResponse> => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      console.error("[api] Error no controlado:", error);
      return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
    }
  };
}