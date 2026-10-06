// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload, toPublicUser } from "@/lib/auth";
import { backendEnabled, backendMessage, forwardAuth, normalizeUser } from "@/lib/backend";
import { findById } from "@/lib/db";
import type { DbUser } from "@/types/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // --- Modo integrado: revalida el JWT contra Spring. ---
  if (backendEnabled()) {
    if (!authHeader) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 });
    }

    const result = await forwardAuth("/api/auth/me", {
      headers: { authorization: authHeader },
    });

    if (result.status !== 200 || !result.body.user) {
      return NextResponse.json(
        { message: backendMessage(result, "Sesión inválida o cuenta desactivada.") },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: normalizeUser(result.body.user) });
  }

  // --- Modo local (mini API de Next): sin backend configurado. ---
  const payload = getTokenPayload(request);
  if (!payload) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const user = findById<DbUser>("users", payload.sub);
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "Sesión inválida o cuenta desactivada." }, { status: 401 });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
