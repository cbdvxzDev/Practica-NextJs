// app/api/auth/reset-password/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { readCollection, updateRecord } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { backendEnabled, backendMessage, forwardAuth } from "@/lib/backend";
import type { DbUser } from "@/types/db";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const INVALID_LINK_MESSAGE =
  "El enlace de recuperación no es válido o ha caducado. Solicita uno nuevo.";

const invalidLink = () =>
  NextResponse.json({ message: INVALID_LINK_MESSAGE }, { status: 400 });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token ?? "").trim();
  const password = String(body?.password ?? "");

  if (!token) return invalidLink();

  if (password.length < 8) {
    return NextResponse.json(
      { message: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  // --- Modo integrado: Spring valida el token contra MongoDB y rehashea
  // la contraseña con BCrypt. ---
  if (backendEnabled()) {
    const result = await forwardAuth("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    if (result.status !== 200) {
      return NextResponse.json(
        { message: backendMessage(result, INVALID_LINK_MESSAGE) },
        { status: result.status >= 400 ? result.status : 400 }
      );
    }

    return NextResponse.json({
      message: "Contraseña actualizada. Ya puedes iniciar sesión.",
    });
  }

  // --- Modo local (mini API de Next): sin backend configurado. ---
  const user = readCollection<DbUser>("users").find(
    (u) => u.passwordResetToken && u.passwordResetToken === hashToken(token)
  );
  if (!user) return invalidLink();

  const expiresAt = user.passwordResetExpiresAt ? Date.parse(user.passwordResetExpiresAt) : 0;
  if (!expiresAt || expiresAt < Date.now()) {
    // El token ya caducó: se limpia para que no se pueda reutilizar.
    updateRecord<DbUser>("users", user.id, {
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    });
    return invalidLink();
  }

  updateRecord<DbUser>("users", user.id, {
    passwordHash: hashPassword(password),
    passwordResetToken: undefined,
    passwordResetExpiresAt: undefined,
  });

  return NextResponse.json({ message: "Contraseña actualizada. Ya puedes iniciar sesión." });
}
