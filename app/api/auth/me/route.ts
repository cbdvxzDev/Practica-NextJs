// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenPayload } from "@/lib/auth";
import { findById } from "@/lib/db";
import type { DbUser } from "@/types/db";

function publicUser(user: DbUser) {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

export async function GET(request: NextRequest) {
  const payload = getTokenPayload(request);
  if (!payload) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const user = findById<DbUser>("users", payload.sub);
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "Sesión inválida o cuenta desactivada." }, { status: 401 });
  }

  return NextResponse.json({ user: publicUser(user) });
}