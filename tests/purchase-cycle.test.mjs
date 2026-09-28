// tests/purchase-cycle.test.mjs
// Test de integración del ciclo de compra completo, de punta a punta:
//
//   registro -> login -> catálogo -> creación de pedido -> descuento de stock
//   -> historial del cliente -> aislamiento entre clientes -> gestión admin
//   -> protección de /admin
//
// Es el test que más vale la pena tener en un e-commerce: si esto pasa, la
// tienda funciona. Corre contra HTTP de verdad, no contra la base de datos.
//
// Los datos se restauran al terminar (ver helpers/data.mjs), así que la suite
// no deja pedidos ni usuarios de prueba en data/.

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

import { ensureServer } from "./helpers/server.mjs";
import { snapshotData, restoreData } from "./helpers/data.mjs";

const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_COST = 12000;

const ADMIN = { email: "admin@giborsec.com", password: "admin123" };

let server;
let baseUrl;
let snapshot;

/** Cliente HTTP mínimo que recuerda la cookie de sesión, como un navegador. */
function createClient(base) {
  let cookie = null;
  return {
    get cookie() {
      return cookie;
    },
    async req(method, path, { body, token, withCookie = true } = {}) {
      const headers = {};
      if (body !== undefined) headers["Content-Type"] = "application/json";
      if (token) headers.Authorization = `Bearer ${token}`;
      if (withCookie && cookie) headers.cookie = cookie;

      const res = await fetch(base + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
      });

      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        const pair = setCookie.split(";")[0];
        if (/=\s*$/.test(pair)) cookie = null;
        else cookie = pair;
      }

      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        /* algunas respuestas (sitemap, redirecciones) no son JSON */
      }
      return { status: res.status, json, text, location: res.headers.get("location") };
    },
  };
}

let unique = 0;
const testEmail = () => `e2e-${Date.now()}-${unique++}@test.co`;

before(async () => {
  snapshot = snapshotData();
  server = await ensureServer();
  baseUrl = server.baseUrl;
});

after(async () => {
  if (server) await server.stop();
  if (snapshot) restoreData(snapshot);
});

describe("ciclo de compra", () => {
  test("el health check dice qué motor de datos está activo", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.ok(["json", "mongo"].includes(body.store), `store inesperado: ${body.store}`);
  });

  test("registro: crea la cuenta, devuelve token y cookie httpOnly", async () => {
    const client = createClient(baseUrl);
    const email = testEmail();
    const res = await client.req("POST", "/api/auth/register", {
      body: { name: "Cliente E2E", email, password: "Cliente123!" },
    });

    assert.equal(res.status, 201);
    assert.ok(res.json.token, "debe devolver token");
    assert.equal(res.json.user.email, email);
    assert.equal(res.json.user.role, "customer");
    assert.equal(res.json.user.passwordHash, undefined, "el hash nunca sale por la API");

    assert.ok(client.cookie, "debe dejar cookie de sesión para el proxy");
    assert.match(client.cookie, /^esencial_session=/);
  });

  test("registro: rechaza contraseñas cortas y correos repetidos", async () => {
    const client = createClient(baseUrl);
    const email = testEmail();

    const short = await client.req("POST", "/api/auth/register", {
      body: { name: "X", email, password: "corta" },
    });
    assert.equal(short.status, 400);

    await client.req("POST", "/api/auth/register", {
      body: { name: "X", email, password: "Cliente123!" },
    });
    const dup = await client.req("POST", "/api/auth/register", {
      body: { name: "X", email, password: "Cliente123!" },
    });
    assert.equal(dup.status, 409, "el segundo registro debe chocar");
  });

  test("login: credenciales malas da 401, las buenas devuelven token", async () => {
    const client = createClient(baseUrl);

    const bad = await client.req("POST", "/api/auth/login", {
      body: { email: ADMIN.email, password: "incorrecta" },
    });
    assert.equal(bad.status, 401);

    const good = await client.req("POST", "/api/auth/login", { body: ADMIN });
    assert.equal(good.status, 200);
    assert.equal(good.json.user.role, "admin");
  });

  test("el token permite consultar el perfil y /api/orders filtra por dueño", async () => {
    const client = createClient(baseUrl);
    const email = testEmail();
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Dueño", email, password: "Cliente123!" },
    });
    const token = reg.json.token;

    const me = await client.req("GET", "/api/auth/me", { token });
    assert.equal(me.status, 200);
    assert.equal(me.json.user.id, reg.json.user.id);

    // Se crea un pedido para este cliente.
    const catalog = await client.req("GET", "/api/products");
    const product = catalog.json.data.find((p) => p.stock > 3 && p.sizes.length > 0);
    const created = await client.req("POST", "/api/orders", {
      token,
      body: {
        items: [{ productId: product.id, quantity: 2, size: product.sizes[0] }],
        shippingAddress: "Calle 1 #2-3, Bogotá",
      },
    });
    assert.equal(created.status, 201);

    // Otro cliente no debe verlo en su historial.
    const other = createClient(baseUrl);
    const otherReg = await other.req("POST", "/api/auth/register", {
      body: { name: "Ajeno", email: testEmail(), password: "Cliente123!" },
    });
    const otherOrders = await other.req("GET", "/api/orders", { token: otherReg.json.token });
    assert.equal(
      otherOrders.json.data.some((o) => o.id === created.json.data.id),
      false,
      "un cliente no debe ver pedidos ajenos"
    );

    // Y tampoco puede abrirlo por id.
    const peek = await other.req("GET", `/api/orders/${created.json.data.id}`, {
      token: otherReg.json.token,
    });
    assert.equal(peek.status, 403);
  });

  test("crear pedido: descuenta stock y cobra envío por debajo del umbral", async () => {
    const client = createClient(baseUrl);
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Comprador", email: testEmail(), password: "Cliente123!" },
    });
    const token = reg.json.token;

    const before = (await client.req("GET", "/api/products")).json.data;
    // Una unidad de una referencia barata: el subtotal se queda por debajo del
    // umbral, así que aquí sí tiene que cobrarse el envío.
    const cheap = before.find((p) => p.stock > 0 && p.price < FREE_SHIPPING_THRESHOLD);
    assert.ok(cheap, "el catálogo debería tener referencias por debajo del umbral de envío");

    const res = await client.req("POST", "/api/orders", {
      token,
      body: {
        items: [{ productId: cheap.id, quantity: 1, size: cheap.sizes[0] }],
        shippingAddress: "Av. Siempre Viva 742",
      },
    });

    assert.equal(res.status, 201);
    const order = res.json.data;
    assert.equal(order.total, cheap.price + SHIPPING_COST, "suma subtotal + envío");
    assert.equal(order.status, "pending");
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.userId, reg.json.user.id, "el pedido guarda el userId");

    const after = (await client.req("GET", "/api/products")).json.data;
    const updated = after.find((p) => p.id === cheap.id);
    assert.equal(updated.stock, cheap.stock - 1, "el stock baja en la cantidad pedida");
  });

  test("crear pedido: envío gratis a partir del umbral", async () => {
    const client = createClient(baseUrl);
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Grande", email: testEmail(), password: "Cliente123!" },
    });
    const token = reg.json.token;

    const products = (await client.req("GET", "/api/products")).json.data;
    // products con stock para llegar al umbral sin pedir de más.
    const unit = products.find((p) => p.stock >= 1 && p.price >= FREE_SHIPPING_THRESHOLD);
    assert.ok(unit, "el catálogo debería tener una referencia por encima del umbral");

    const res = await client.req("POST", "/api/orders", {
      token,
      body: {
        items: [{ productId: unit.id, quantity: 1, size: unit.sizes[0] }],
        shippingAddress: "Calle 100 #10-20",
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.json.data.total, unit.price, "por encima del umbral no se cobra envío");
  });

  test("crear pedido: valida items, dirección, stock y talla", async () => {
    const client = createClient(baseUrl);
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Exigente", email: testEmail(), password: "Cliente123!" },
    });
    const token = reg.json.token;
    const products = (await client.req("GET", "/api/products")).json.data;
    const product = products.find((p) => p.stock > 1);

    const noItems = await client.req("POST", "/api/orders", { token, body: { items: [], shippingAddress: "X" } });
    assert.equal(noItems.status, 400, "carrito vacío");

    const noAddress = await client.req("POST", "/api/orders", {
      token,
      body: { items: [{ productId: product.id, quantity: 1 }], shippingAddress: "  " },
    });
    assert.equal(noAddress.status, 400, "dirección obligatoria");

    const ghost = await client.req("POST", "/api/orders", {
      token,
      body: { items: [{ productId: "no-existe", quantity: 1 }], shippingAddress: "X" },
    });
    assert.equal(ghost.status, 400, "producto inexistente");

    const badSize = await client.req("POST", "/api/orders", {
      token,
      body: {
        items: [{ productId: product.id, quantity: 1, size: "XXXXL" }],
        shippingAddress: "X",
      },
    });
    assert.equal(badSize.status, 400, "talla no existente");

    const noStock = await client.req("POST", "/api/orders", {
      token,
      body: { items: [{ productId: product.id, quantity: 99999 }], shippingAddress: "X" },
    });
    assert.equal(noStock.status, 409, "stock insuficiente");
  });

  test("crear pedido sin sesión da 401", async () => {
    const client = createClient(baseUrl);
    const res = await client.req("POST", "/api/orders", {
      body: { items: [{ productId: "x", quantity: 1 }], shippingAddress: "X" },
    });
    assert.equal(res.status, 401);
  });

  test("dos tallas del mismo producto son líneas distintas", async () => {
    const client = createClient(baseUrl);
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Dos Tallas", email: testEmail(), password: "Cliente123!" },
    });
    const token = reg.json.token;

    const products = (await client.req("GET", "/api/products")).json.data;
    const product = products.find((p) => p.stock > 2 && p.sizes.length >= 2);
    const [sizeA, sizeB] = product.sizes;

    const res = await client.req("POST", "/api/orders", {
      token,
      body: {
        items: [
          { productId: product.id, quantity: 1, size: sizeA },
          { productId: product.id, quantity: 1, size: sizeB },
        ],
        shippingAddress: "Carrera 7 #45-90",
      },
    });

    assert.equal(res.status, 201);
    const lines = res.json.data.items.filter((i) => i.name === product.title);
    assert.equal(lines.length, 2, "cada talla es su propia línea");
  });

  test("admin: ve todos los pedidos y puede cambiar el estado", async () => {
    const admin = createClient(baseUrl);
    await admin.req("POST", "/api/auth/login", { body: ADMIN });
    const token = (await admin.req("POST", "/api/auth/login", { body: ADMIN })).json.token;

    const all = await admin.req("GET", "/api/orders", { token });
    assert.equal(all.status, 200);
    const someOrder = all.json.data[0];
    assert.ok(someOrder, "debe haber pedidos");

    const ok = await admin.req("PATCH", `/api/orders/${someOrder.id}/status`, {
      token,
      body: { status: "shipped" },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.data.status, "shipped");

    const invalid = await admin.req("PATCH", `/api/orders/${someOrder.id}/status`, {
      token,
      body: { status: "inventado" },
    });
    assert.equal(invalid.status, 400, "estado fuera del enum");
  });

  test("un cliente no puede tocar la gestión de pedidos ni de usuarios", async () => {
    const client = createClient(baseUrl);
    const reg = await client.req("POST", "/api/auth/register", {
      body: { name: "Curioso", email: testEmail(), password: "Cliente123!" },
    });
    const token = reg.json.token;

    const users = await client.req("GET", "/api/users", { token });
    assert.equal(users.status, 403, "listar usuarios");

    const create = await client.req("POST", "/api/products", {
      token,
      body: { sku: "X", title: "X", price: 1, category: "abrigo" },
    });
    assert.equal(create.status, 403, "crear productos");

    const orders = (await client.req("GET", "/api/orders", { token })).json.data;
    if (orders.length > 0) {
      const status = await client.req("PATCH", `/api/orders/${orders[0].id}/status`, {
        token,
        body: { status: "delivered" },
      });
      assert.equal(status.status, 403, "cambiar el estado de un pedido");
    }
  });
});

describe("protección de /admin", () => {
  test("sin cookie redirige a /login recordando el destino", async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard`, { redirect: "manual" });
    assert.equal(res.status, 307);
    assert.match(res.headers.get("location"), /^\/login\?next=%2Fadmin/);
  });

  test("con cookie de cliente redirige a la tienda", async () => {
    const client = createClient(baseUrl);
    await client.req("POST", "/api/auth/register", {
      body: { name: "Intruso", email: testEmail(), password: "Cliente123!" },
    });
    const res = await fetch(`${baseUrl}/admin/products`, {
      redirect: "manual",
      headers: { cookie: client.cookie },
    });
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), "/");
  });

  test("con cookie de admin entra al panel", async () => {
    const client = createClient(baseUrl);
    await client.req("POST", "/api/auth/login", { body: ADMIN });
    const res = await fetch(`${baseUrl}/admin/dashboard`, {
      redirect: "manual",
      headers: { cookie: client.cookie },
    });
    assert.equal(res.status, 200);
  });

  test("una cookie manipulada no abre el panel", async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard`, {
      redirect: "manual",
      headers: { cookie: "esencial_session=eyJzdWIiOiJ1c3ItMSJ9. firma-falsa" },
    });
    assert.equal(res.status, 307);
  });

  test("el logout borra la cookie en el servidor", async () => {
    const client = createClient(baseUrl);
    await client.req("POST", "/api/auth/login", { body: ADMIN });
    assert.ok(client.cookie);

    const res = await client.req("POST", "/api/auth/logout");
    assert.equal(res.status, 200);
    assert.equal(client.cookie, null, "la cookie debe quedar vacía");

    // Y con la cookie muerta, el panel ya no se sirve.
    const after = await fetch(`${baseUrl}/admin/dashboard`, { redirect: "manual" });
    assert.equal(after.status, 307);
  });
});
