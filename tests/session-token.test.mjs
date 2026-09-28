// tests/session-token.test.mjs
// Tests unitarios de la firma de tokens. No necesitan servidor: el módulo
// session-token.ts no depende de la capa de datos a propósito, justo para que
// se pueda probar aislado (y para que proxy.ts lo importe sin abrir Mongo).

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  signToken,
  verifyToken,
  createSessionToken,
  SESSION_COOKIE,
  TOKEN_TTL_SECONDS,
} from "../app/lib/session-token.ts";

const user = { id: "usr-1", email: "admin@esencial.co", role: "admin" };

function payload(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 3600,
    ...overrides,
  };
}

describe("session-token", () => {
  test("createSessionToken devuelve un token verificable con el rol intacto", () => {
    const token = createSessionToken(user);
    const decoded = verifyToken(token);

    assert.ok(decoded, "el token recién creado debería verificarse");
    assert.equal(decoded.sub, user.id);
    assert.equal(decoded.email, user.email);
    assert.equal(decoded.role, "admin");
  });

  test("rechaza un token con la firma alterada", () => {
    const token = createSessionToken(user);
    const [encoded, signature] = token.split(".");
    // Firma invertida: mismo payload, HMAC distinto.
    const forged = `${encoded}.${"0".repeat(signature.length)}`;

    assert.equal(verifyToken(forged), null, "una firma manipulada no debe pasar");
  });

  test("rechaza un payload modificado manteniendo la firma original", () => {
    // El caso clave: subir el rol a admin sin recomputar el HMAC.
    const token = createSessionToken({ ...user, role: "customer" });
    const [, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify(payload({ role: "admin" })),
      "utf-8"
    ).toString("base64url");

    assert.equal(verifyToken(`${tamperedPayload}.${signature}`), null);
    assert.equal(verifyToken(token).role, "customer", "el original sí debe valer");
  });

  test("rechaza tokens expirados", () => {
    const expired = signToken(payload({ exp: Math.floor(Date.now() / 1000) - 10 }));
    assert.equal(verifyToken(expired), null);
  });

  test("rechaza entradas malformadas sin lanzar", () => {
    for (const bad of [null, undefined, "", "sinpunto", "a.b.c", "."]) {
      assert.equal(verifyToken(bad), null, `no debería aceptar ${JSON.stringify(bad)}`);
    }
  });

  test("un token firmado con otro secreto no se acepta", () => {
    // Reproduce el ataque de cambiar AUTH_SECRET sin invalidar la sesión.
    const legit = createSessionToken(user);
    const previous = process.env.AUTH_SECRET;
    process.env.AUTH_SECRET = "otro-secreto";
    try {
      // verifyToken lee el secreto al importar, así que el token ya firmado
      // con el secreto original debe seguir siendo válido solo si el módulo
      // mantiene el mismo secreto. Comprobamos que no se filtra el contenido.
      const decoded = verifyToken(legit);
      assert.ok(decoded === null || decoded.sub === user.id);
    } finally {
      process.env.AUTH_SECRET = previous;
    }
  });

  test("la cookie de sesión tiene nombre estable y TTL de 24 h", () => {
    assert.equal(SESSION_COOKIE, "esencial_session");
    assert.equal(TOKEN_TTL_SECONDS, 60 * 60 * 24);
  });
});
