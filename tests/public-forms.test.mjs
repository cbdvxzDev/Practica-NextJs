// tests/public-forms.test.mjs
// Tests del newsletter y del formulario de contacto: los dos formularios que
// antes eran maquetas (uno ponía "¡Gracias!" sin hacer nada, el otro no
// existía). Aquí se comprueba que de verdad guardan y que validan.
//
// Ojo con las aserciones: las pruebas comparten almacenamiento, así que se
// comparan siempre contra la línea base capturada en `before`, nunca con
// números absolutos.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

import { ensureServer } from "./helpers/server.mjs";
import { snapshotData, restoreData, readData } from "./helpers/data.mjs";

let server;
let baseUrl;
let snapshot;

function subscribers() {
  return readData("subscribers");
}

function messages() {
  return readData("contactMessages");
}

async function post(path, body) {
  const res = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

async function login(email, password) {
  const res = await post("/api/auth/login", { email, password });
  assert.equal(res.status, 200, `login de ${email} debería funcionar`);
  return res.json.token;
}

before(async () => {
  snapshot = snapshotData();
  server = await ensureServer();
  baseUrl = server.baseUrl;
});

after(async () => {
  if (server) await server.stop();
  if (snapshot) restoreData(snapshot);
});

describe("newsletter", () => {
  test("da de alta un correo y lo persiste", async () => {
    const before = subscribers().length;
    const email = `news-${Date.now()}@test.co`;
    const res = await post("/api/newsletter", { email });

    assert.equal(res.status, 201);
    assert.equal(res.json.alreadySubscribed, false);

    const saved = subscribers();
    assert.equal(saved.length, before + 1, "debe añadirse un suscriptor");
    assert.ok(saved.some((s) => s.email === email));
  });

  test("es idempotente: suscribirse dos veces no duplica", async () => {
    const email = `dup-${Date.now()}@test.co`;

    const first = await post("/api/newsletter", { email });
    const second = await post("/api/newsletter", { email });

    assert.equal(first.status, 201);
    assert.equal(second.status, 200);
    assert.equal(second.json.alreadySubscribed, true);
    assert.equal(
      subscribers().filter((s) => s.email === email).length,
      1,
      "no debe crear un segundo registro"
    );
  });

  test("normaliza el correo: mayúsculas y espacios no cuentan como otro", async () => {
    const email = `norm-${Date.now()}@test.co`;

    await post("/api/newsletter", { email });
    const res = await post("/api/newsletter", { email: `  ${email.toUpperCase()}  ` });

    assert.equal(res.status, 200, "mismo correo con otro formato");
    assert.equal(
      subscribers().filter((s) => s.email === email).length,
      1,
      "debe reconocer el correo ya existente"
    );
  });

  test("rechaza correos inválidos con el error por campo", async () => {
    const before = subscribers().length;

    for (const bad of ["", "   ", "no-es-correo", "a@b", "@test.co", "espacio en@test.co"]) {
      const res = await post("/api/newsletter", { email: bad });
      assert.equal(res.status, 400, `debería rechazar ${JSON.stringify(bad)}`);
      assert.ok(res.json.details?.email, "debe indicar el campo culpable");
    }

    assert.equal(subscribers().length, before, "nada inválido se guarda");
  });

  test("la trampa de honey responde ok pero no guarda nada", async () => {
    const before = subscribers().length;
    const res = await post("/api/newsletter", {
      email: `bot-${Date.now()}@test.co`,
      website: "http://spam.example.com",
    });

    assert.equal(res.status, 201, "el bot no debe distinguirse por el status");
    assert.equal(subscribers().length, before, "pero tampoco debe guardar nada");
  });

  test("la lista está restringida a soporte", async () => {
    // 403 y no 401 por coherencia con el resto del panel (`app/api/users`):
    // allí también se responde 403 tanto si no hay sesión como si el rol no vale.
    assert.equal((await fetch(`${baseUrl}/api/newsletter`)).status, 403);
    assert.equal(
      (await fetch(`${baseUrl}/api/newsletter`, { headers: { Authorization: "Bearer basura" } }))
        .status,
      403
    );

    const customerToken = await login("carlos@example.com", "carlos123");
    assert.equal(
      (await fetch(`${baseUrl}/api/newsletter`, { headers: { Authorization: `Bearer ${customerToken}` } }))
        .status,
      403,
      "un cliente tampoco puede listar suscriptores"
    );
  });

  test("soporte puede listar y dar de baja", async () => {
    const email = `baja-${Date.now()}@test.co`;
    await post("/api/newsletter", { email });
    const headers = { Authorization: `Bearer ${await login("soporte@giborsec.com", "soporte123")}` };

    const list = await fetch(`${baseUrl}/api/newsletter`, { headers });
    assert.equal(list.status, 200);
    assert.ok(
      (await list.json()).data.some((s) => s.email === email),
      "el suscriptor recién creado debe estar en la lista"
    );

    const removed = await fetch(
      `${baseUrl}/api/newsletter?email=${encodeURIComponent(email)}`,
      { method: "DELETE", headers }
    );
    assert.equal(removed.status, 200);
    assert.equal(
      subscribers().some((s) => s.email === email),
      false,
      "la baja debe eliminarla del almacenamiento"
    );
  });
});

describe("contacto", () => {
  test("guarda un mensaje válido y lo limpia", async () => {
    const before = messages().length;
    const email = `contacto-${Date.now()}@test.co`;
    const res = await post("/api/contact", {
      name: "  Carolina Gómez  ",
      email: `  ${email.toUpperCase()}  `,
      topic: "pedido",
      message: "  Quisiera saber   cuánto tarda   el envío a Bogotá.  ",
    });

    assert.equal(res.status, 201);

    const saved = messages();
    assert.equal(saved.length, before + 1);
    const message = saved[saved.length - 1];
    assert.equal(message.email, email, "el correo se normaliza");
    assert.equal(message.name, "Carolina Gómez", "el nombre se recorta");
    assert.equal(message.topic, "pedido");
    assert.equal(message.read, false, "llega sin leer");
    assert.equal(
      message.message,
      "Quisiera saber cuánto tarda el envío a Bogotá.",
      "los espacios redundantes se colapsan"
    );
  });

  test("devuelve todos los errores de golpe, no solo el primero", async () => {
    const before = messages().length;
    const res = await post("/api/contact", { name: "", email: "malo", topic: "inventado" });

    assert.equal(res.status, 400);
    assert.ok(res.json.details.name, "falla el nombre");
    assert.ok(res.json.details.email, "falla el correo");
    assert.ok(res.json.details.topic, "falla el motivo");
    assert.ok(res.json.details.message, "falla el mensaje");
    assert.equal(messages().length, before, "un formulario inválido no se guarda");
  });

  test("acepta los cuatro motivos oficiales y rechaza el resto", async () => {
    for (const topic of ["pedido", "producto", "devoluciones", "otro"]) {
      const res = await post("/api/contact", {
        name: "Prueba",
        email: "prueba@test.co",
        topic,
        message: "Mensaje de prueba suficientemente largo.",
      });
      assert.equal(res.status, 201, `motivo ${topic} debería valer`);
    }

    const before = messages().length;
    const bad = await post("/api/contact", {
      name: "Prueba",
      email: "prueba@test.co",
      topic: "quiero una motocicleta",
      message: "Mensaje de prueba suficientemente largo.",
    });
    assert.equal(bad.status, 400);
    assert.equal(messages().length, before);
  });

  test("rechaza los mensajes que superan el máximo en vez de truncarlos", async () => {
    // Se rechaza en vez de cortar en silencio: si el usuario escribe 5000
    // caracteres, guardarlos truncados pierde justo el final, que suele ser
    // donde está la pregunta. El formulario lleva contador y avisa antes.
    const before = messages().length;
    const res = await post("/api/contact", {
      name: "Prueba",
      email: "prueba@test.co",
      topic: "otro",
      message: "a".repeat(5000),
    });

    assert.equal(res.status, 400);
    assert.ok(res.json.details.message, "debe explicar que es demasiado largo");
    assert.equal(messages().length, before);
  });

  test("la trampa de honey responde ok pero no guarda nada", async () => {
    const before = messages().length;
    const res = await post("/api/contact", {
      name: "Bot",
      email: "bot@test.co",
      topic: "otro",
      message: "Compra Cheap Pills Ahora",
      website: "http://spam.example.com",
    });

    assert.equal(res.status, 201);
    assert.equal(messages().length, before, "pero el mensaje no debe existir");
  });

  test("la bandeja está restringida a soporte", async () => {
    assert.equal((await fetch(`${baseUrl}/api/contact`)).status, 403);

    const customerToken = await login("carlos@example.com", "carlos123");
    const asCustomer = await fetch(`${baseUrl}/api/contact`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(asCustomer.status, 403, "un cliente no puede leer la bandeja");
  });

  test("soporte ve los mensajes con su etiqueta", async () => {
    const token = await login("soporte@giborsec.com", "soporte123");
    const res = await fetch(`${baseUrl}/api/contact`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.length > 0);
    assert.ok(body.data[0].topicLabel, "cada mensaje trae su motivo en texto");
  });
});
