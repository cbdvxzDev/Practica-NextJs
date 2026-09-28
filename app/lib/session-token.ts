// app/lib/session-token.ts
// Firma y verificación de tokens de sesión.
//
// Este módulo NO importa la capa de datos a propósito: `proxy.ts` necesita
// verificar el token en cada request a /admin, y arrastrar `@/lib/db` (y con
// ella el motor de archivos o el driver de Mongo) al proxy abriría una
// conexión por cada request. Aquí solo hay criptografía, que es lo único que
// hace falta para decidir si una sesión es válida y qué rol tiene.

import crypto from "crypto";

/**
 * Secreto de firma de las sesiones.
 *
 * <p>Un valor fijo, y no uno aleatorio por ejecucion, porque este modulo se
 * empaqueta en mas de un bundle del servidor: `proxy.ts` corre en el proxy y
 * los route handlers en el servidor de la app. Si cada bundle generara su
 * propio secreto, un token firmado en el login no verificaria en el proxy y
 * toda sesion pareceria caducada.
 *
 * <p>Que el valor este en el repositorio solo es aceptable mientras sea de
 * desarrollo. `app/instrumentation.ts` se niega a arrancar en produccion con
 * este valor o sin ninguno, de modo que nunca se sirve con el.
 */
const DEV_SECRET = "esencial-dev-secret-cambiar-en-produccion";

const CONFIGURED_SECRET = process.env.AUTH_SECRET;

const SECRET = CONFIGURED_SECRET && CONFIGURED_SECRET.length > 0 ? CONFIGURED_SECRET : DEV_SECRET;

/** Duración real de la sesión: 24 horas. */
export const TOKEN_TTL_SECONDS = 60 * 60 * 24;

/** Nombre de la cookie de sesión. Es httpOnly: el JS de la página no la lee. */
export const SESSION_COOKIE = "esencial_session";

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * Firma un payload y produce un token: base64url(payload).hmacHex
 */
export function signToken(payload: TokenPayload): string {
  const encoded = b64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(encoded)
    .digest("hex");
  return `${encoded}.${signature}`;
}

/**
 * Verifica un token y devuelve su payload. null si es inválido o expiró.
 */
export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as TokenPayload;
    if (!payload.sub || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Crea un token de sesión para un usuario.
 */
export function createSessionToken(user: { id: string; email: string; role: string }): string {
  const now = Math.floor(Date.now() / 1000);
  return signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  });
}
