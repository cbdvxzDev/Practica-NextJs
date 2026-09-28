// app/api/contact/route.ts
// Mensajes del formulario de contacto.
//
// Es público (el contacto no presupone cuenta), con las mismas guardas que el
// newsletter: validación en servidor y trampa de honey contra bots.

import { NextRequest, NextResponse } from "next/server";
import { generateId, insertRecord, readCollection } from "@/lib/db";
import { ForbiddenError, getCurrentUser } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { errorBag, normalizeMessage } from "@/lib/validation";
import { CONTACT_TOPICS, type DbContactMessage } from "@/types/db";

const MAX_MESSAGE_LENGTH = 2000;

const TOPIC_LABELS: Record<string, string> = {
  pedido: "un pedido",
  producto: "un producto",
  devoluciones: "devoluciones",
  otro: "otro asunto",
};

export const POST = apiHandler(async (request: NextRequest) => {
  const body = await request.json().catch(() => ({}));

  if (isHoneypotFilled(body)) {
    return NextResponse.json(
      { message: "¡Gracias! Te responderemos muy pronto." },
      { status: 201 }
    );
  }

  const bag = errorBag();
  const name = bag.text("name", body?.name, "El nombre", 80);
  const email = bag.email("email", body?.email);
  const topic = bag.oneOf("topic", body?.topic, CONTACT_TOPICS, "El motivo");
  const message = bag.text("message", body?.message, "El mensaje", MAX_MESSAGE_LENGTH);

  // `topic` solo es null cuando la validación ya ha fallado, así que esta
  // comprobación extra es para que TypeScript lo vea.
  if (!bag.ok || !topic) {
    return NextResponse.json(
      { message: "Revisa los campos marcados antes de enviar.", details: bag.toJSON() },
      { status: 400 }
    );
  }

  insertRecord<DbContactMessage>("contactMessages", {
    id: generateId("msg"),
    name,
    email,
    topic,
    // Colapsa espacios y corta al máximo, para no guardar muros de texto.
    message: normalizeMessage(message, MAX_MESSAGE_LENGTH),
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { message: `¡Gracias, ${name.split(" ")[0]}! Te responderemos por correo.` },
    { status: 201 }
  );
});

/** Bandeja de mensajes para soporte. */
export const GET = apiHandler(async (request: NextRequest) => {
  const user = getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "support")) {
    throw new ForbiddenError("Solo soporte puede ver los mensajes de contacto.");
  }

  const { searchParams } = new URL(request.url);
  const onlyUnread = searchParams.get("unread") === "1";

  const messages = readCollection<DbContactMessage>("contactMessages")
    .filter((m) => (onlyUnread ? !m.read : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((m) => ({ ...m, topicLabel: TOPIC_LABELS[m.topic] ?? m.topic }));

  return NextResponse.json({ data: messages, meta: { total: messages.length } });
});

function isHoneypotFilled(body: unknown): boolean {
  const website = (body as { website?: unknown } | null)?.website;
  return typeof website === "string" && website.trim().length > 0;
}
