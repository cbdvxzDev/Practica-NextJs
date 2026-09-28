// app/api/newsletter/route.ts
// Alta en la lista de la "Carta Esencial".
//
// El POST es público a propósito (nadie está logueado en la home), así que lleva
// su propio acompañamiento:
//   - normaliza el correo para no duplicar suscripciones,
//   - es idempotente: suscribirse dos veces no crea dos registros,
//   - trampa de honey (campo invisible) para frenar bots sin captcha.
//
// El GET y el DELETE sí son de soporte, y usan el mismo control de rol que el
// resto del panel (`app/api/users`) en vez de inventar un token aparte.

import { NextRequest, NextResponse } from "next/server";
import { deleteRecord, generateId, insertRecord, readCollection } from "@/lib/db";
import { ForbiddenError, getCurrentUser } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { errorBag, normalizeEmail } from "@/lib/validation";
import type { DbSubscriber } from "@/types/db";

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));

  // Campo trampa: los humanos no lo ven, los bots lo rellenan.
  if (isHoneypotFilled(body)) {
    // Se responde como si hubiera ido bien, pero sin guardar nada.
    return NextResponse.json(
      { message: "¡Listo! Te escribiremos con la próxima carta.", alreadySubscribed: false },
      { status: 201 }
    );
  }

  const bag = errorBag();
  const email = bag.email("email", body?.email);

  if (!bag.ok) {
    return NextResponse.json(
      { message: "Revisa el formulario antes de enviarlo.", details: bag.toJSON() },
      { status: 400 }
    );
  }

  const existing = readCollection<DbSubscriber>("subscribers").find((s) => s.email === email);
  if (existing) {
    // Idempotente: no se duplica ni se molesta a quien ya está suscrito.
    return NextResponse.json(
      { message: "Ya estás en la lista.", alreadySubscribed: true },
      { status: 200 }
    );
  }

  insertRecord<DbSubscriber>("subscribers", {
    id: generateId("sub"),
    email,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { message: "¡Listo! Te escribiremos con la próxima carta.", alreadySubscribed: false },
    { status: 201 }
  );
});

/** Lista de suscriptores para el equipo de soporte. */
export const GET = apiHandler(async (request: NextRequest) => {
  requireSupport(request);

  const subscribers = readCollection<DbSubscriber>("subscribers").sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return NextResponse.json({ data: subscribers, meta: { total: subscribers.length } });
});

/** Da de baja a un suscriptor (lo que hace el enlace del pie del email). */
export const DELETE = apiHandler(async (request: NextRequest) => {
  requireSupport(request);

  const email = normalizeEmail(new URL(request.url).searchParams.get("email"));
  const existing = readCollection<DbSubscriber>("subscribers").find((s) => s.email === email);

  if (!existing) {
    return NextResponse.json({ message: "Ese correo no está suscrito." }, { status: 404 });
  }

  deleteRecord("subscribers", existing.id);
  return NextResponse.json({ message: "Baja registrada." });
});

function isHoneypotFilled(body: unknown): boolean {
  const website = (body as { website?: unknown } | null)?.website;
  return typeof website === "string" && website.trim().length > 0;
}

function requireSupport(request: NextRequest): void {
  const user = getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "support")) {
    throw new ForbiddenError("Solo soporte puede gestionar la lista de suscriptores.");
  }
}
