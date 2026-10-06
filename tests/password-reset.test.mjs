// tests/password-reset.test.mjs
// Flujo de recuperación de contraseña: hasta ahora el enlace "¿La olvidaste?"
// abría un mailto, así que no había nada que probar. Aquí se cubre el par de
// endpoints nuevos y el ciclo completo: pedir enlace, cambiar la contraseña y
// entrar con la nueva.
//
// Ojo con las aserciones: las pruebas comparten almacenamiento, así que se
// comparan siempre contra la línea base capturada en `before`.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

import { ensureServer } from "./helpers/server.mjs";
import { snapshotData, restoreData, readData } from "./helpers/data.mjs";

let server;
let baseUrl;
let snapshot;
let account;

async function post(path, body) {
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

function storedUser(email) {
  return readData("users").find((u) => u.email === email);
}

before(async () => {
  snapshot = snapshotData();
  server = await ensureServer();
  baseUrl = server.baseUrl;

  const stamp = Date.now();
  account = {
    name: "Laura Restablece",
    email: `reset-${stamp}@test.co`,
    password: "clave-vieja-123",
  };

  const res = await post("/api/auth/register", account);
  assert.equal(res.status, 201, "el registro de la cuenta base debe funcionar");
});

after(async () => {
  if (server) await server.stop();
  if (snapshot) restoreData(snapshot);
});

describe("recuperación de contraseña", () => {
  test("rechaza un correo mal formado", async () => {
    const res = await post("/api/auth/forgot-password", { email: "no-es-un-correo" });
    assert.equal(res.status, 400);
  });

  test("responde igual de un correo inexistente para no filtrar la base", async () => {
    const unknown = await post("/api/auth/forgot-password", {
      email: `nadie-${Date.now()}@test.co`,
    });
    const known = await post("/api/auth/forgot-password", { email: account.email });

    assert.equal(unknown.status, 200);
    assert.equal(known.status, 200);
    assert.equal(unknown.json.message, known.json.message);
    assert.equal(unknown.json.resetUrl, undefined, "no debe entregar enlace sin cuenta");
    assert.ok(known.json.resetUrl, "con cuenta sí debe devolver el enlace");
  });

  test("guarda el token hasheado con caducidad, nunca el token en claro", async () => {
    const res = await post("/api/auth/forgot-password", { email: account.email });
    const token = new URL(res.json.resetUrl).searchParams.get("token");

    assert.ok(token && token.length >= 32, "el enlace trae un token largo");

    const user = storedUser(account.email);
    assert.ok(user.passwordResetToken, "quede guardado en el usuario");
    assert.notEqual(user.passwordResetToken, token, "se guarda hasheado");
    assert.ok(Date.parse(user.passwordResetExpiresAt) > Date.now(), "aún no caduca");

    account.token = token;
  });

  test("no cambia la contraseña con un token inventado ni con una clave corta", async () => {
    const fake = await post("/api/auth/reset-password", {
      token: "a".repeat(64),
      password: "otra-clave-456",
    });
    assert.equal(fake.status, 400);

    const short = await post("/api/auth/reset-password", {
      token: account.token,
      password: "1234567",
    });
    assert.equal(short.status, 400);

    const stillOld = await post("/api/auth/login", { email: account.email, password: account.password });
    assert.equal(stillOld.status, 200, "las credenciales originales siguen válidas");
  });

  test("cambia la contraseña, limpia el token y deja entrar con la nueva", async () => {
    const newPassword = "clave-nueva-456";
    const res = await post("/api/auth/reset-password", {
      token: account.token,
      password: newPassword,
    });
    assert.equal(res.status, 200);

    const user = storedUser(account.email);
    assert.equal(user.passwordResetToken, undefined, "el token se consume");
    assert.equal(user.passwordResetExpiresAt, undefined);

    const oldLogin = await post("/api/auth/login", { email: account.email, password: account.password });
    assert.equal(oldLogin.status, 401, "la contraseña anterior deja de servir");

    const newLogin = await post("/api/auth/login", { email: account.email, password: newPassword });
    assert.equal(newLogin.status, 200, "la contraseña nueva abre sesión");
  });

  test("el enlace no se puede reutilizar", async () => {
    const res = await post("/api/auth/reset-password", {
      token: account.token,
      password: "otra-vez-789",
    });
    assert.equal(res.status, 400, "un token ya consumido vuelve a rechazarse");
  });
});
