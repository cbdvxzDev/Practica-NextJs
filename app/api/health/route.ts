// app/api/health/route.ts
// Sonda publica que dice que motor de datos esta activo. Es la forma rapida de
// comprobar si Mongo entro en juego al definir MONGODB_URI, sin tener que
// adivinar por la consola.

import { NextResponse } from "next/server";
import { dataStoreName } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const store = dataStoreName();

  return NextResponse.json(
    {
      status: "ok",
      store,
      mongoConfigured: Boolean(process.env.MONGODB_URI),
    },
    { status: 200 }
  );
}
