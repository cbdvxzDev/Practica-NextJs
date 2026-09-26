// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { readCollection } from "@/lib/db";
import { createSessionToken, toPublicUser, verifyPassword } from "@/lib/auth";
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

  const user = readCollection<DbUser>("users").find((u) => u.email.toLowerCase() === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json({ message: "Tu cuenta está desactivada. Contacta soporte." }, { status: 403 });
  }

  const token = createSessionToken(user);

  return NextResponse.json({
    token,
    user: toPublicUser(user),
  });
}
