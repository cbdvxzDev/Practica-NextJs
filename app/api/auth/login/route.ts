// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { createSessionToken, setSessionCookie, toPublicUser, verifyPassword } from "@/lib/auth";
import { backendEnabled, backendMessage, forwardAuth, normalizeUser } from "@/lib/backend";
import type { DbUser } from "@/types/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json(
      { message: "Correo electrónico y contraseña son obligatorios." },
      { status: 400 }
    );
  }

  // --- Modo integrado: Spring emite el JWT y el BFF solo firma la cookie. ---
  if (backendEnabled()) {
    const result = await forwardAuth("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.status !== 200 || typeof result.body.token !== "string") {
      return NextResponse.json(
        { message: backendMessage(result, "Credenciales inválidas.") },
        { status: result.status === 200 ? 401 : result.status }
      );
    }

    const user = normalizeUser(result.body.user);
    const response = NextResponse.json({
      token: result.body.token,
      user,
    });
    // proxy.ts no entiende JWTs de Spring, así que la cookie lleva el token
    // HMAC propio de Next; el cliente se queda con el JWT para el Bearer.
    setSessionCookie(
      response,
      createSessionToken({ id: user.id, email: user.email, role: user.role })
    );
    return response;
  }

  // --- Modo local (mini API de Next): sin backend configurado. ---
  const user = readCollection<DbUser>("users").find((u) => u.email.toLowerCase() === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json({ message: "Tu cuenta está desactivada. Contacta soporte." }, { status: 403 });
  }

  const token = createSessionToken(user);

  const response = NextResponse.json({
    token,
    user: toPublicUser(user),
  });

  // La cookie permite que proxy.ts valide la sesión en el servidor, sin
  // depender de que el panel confíe en el store del navegador.
  setSessionCookie(response, token);

  return response;
}
