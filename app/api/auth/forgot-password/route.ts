// app/api/auth/forgot-password/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readCollection, updateRecord } from "@/lib/db";
import { backendEnabled, backendMessage, forwardAuth } from "@/lib/backend";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import type { DbUser } from "@/types/db";

/** El enlace caduca en 15 minutos. */
const RESET_TTL_MS = 15 * 60 * 1000;

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body?.email);

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "El correo electrónico no es válido." }, { status: 400 });
  }

  // Misma respuesta exista o no la cuenta: si no, el formulario serviría para
  // averiguar qué correos están registrados en la tienda.
  const genericMessage =
    "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.";

  // --- Modo integrado: Spring guarda el token en MongoDB y "envía" el correo.
  // El backend devuelve además resetUrl de demostración, igual que aquí. ---
  if (backendEnabled()) {
    const result = await forwardAuth("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (result.status !== 200) {
      return NextResponse.json(
        { message: backendMessage(result, genericMessage) },
        { status: result.status }
      );
    }

    return NextResponse.json({
      message: genericMessage,
      ...(typeof result.body.resetUrl === "string" ? { resetUrl: result.body.resetUrl } : {}),
    });
  }

  // --- Modo local (mini API de Next): sin backend configurado. ---
  const user = readCollection<DbUser>("users").find((u) => u.email.toLowerCase() === email);
  if (!user || !user.isActive) {
    return NextResponse.json({ message: genericMessage });
  }

  const token = crypto.randomBytes(32).toString("hex");
  updateRecord<DbUser>("users", user.id, {
    passwordResetToken: hashToken(token),
    passwordResetExpiresAt: new Date(Date.now() + RESET_TTL_MS).toISOString(),
  });

  /* Esta mini-API no tiene envío de correo: en un despliegue real el enlace
     viajaría por email y la respuesta solo llevaría `message`. Aquí se
     devuelve además para poder completar la demostración sin un SMTP. */
  const origin = request.nextUrl.origin || "http://localhost:3000";

  return NextResponse.json({
    message: genericMessage,
    resetUrl: `${origin}/reset-password?token=${token}`,
  });
}
