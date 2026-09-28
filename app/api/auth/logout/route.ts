// app/api/auth/logout/route.ts
// Cierra la sesión en el servidor borrando la cookie. El cliente también limpia
// su localStorage, pero si solo se hiciera eso la cookie seguiría viva y
// proxy.ts dejaría pasar a /admin.

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
