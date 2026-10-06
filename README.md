# Esencial — tienda de moda minimalista (Full Stack)

E-commerce de moda minimalista con **tienda pública, panel de administración,
autenticación, carrito, checkout, pedidos y backend propio en Spring Boot**.

El proyecto está organizado en dos partes que funcionan por separado:

| Parte | Carpeta | Qué es |
| --- | --- | --- |
| **Frontend** | `app/` | Next.js 16 con su propia capa de datos, lista para usar sin configurar nada. |
| **Backend** | `backend/` | API REST en Spring Boot 4 + MongoDB, con JWT, Swagger y tests. |

> El frontend **aún no consume la API de Spring Boot**: hoy habla con su propia
> capa de datos en `app/api/`. Las dos partes están completas y probadas por
> separado; conectarlas es el siguiente paso. Ver
> [Estado del proyecto](#-estado-del-proyecto).

---

## 🦊 Stack

### Frontend

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Lenguaje | TypeScript (`strict`) |
| Estilos | Tailwind CSS v4 + `cn()` (clsx + tailwind-merge) |
| Estado | Zustand con persistencia en localStorage |
| Datos | Capa propia con dos motores: archivos JSON o MongoDB |
| Iconos | lucide-react |

### Backend

| Capa | Tecnología |
| --- | --- |
| Framework | Spring Boot 4.1.1 (Java 21) |
| Datos | Spring Data MongoDB |
| Seguridad | Spring Security + OAuth2 Resource Server (JWT HS256) + BCrypt |
| Documentación | springdoc-openapi (Swagger UI) |
| Tests | JUnit 5, AssertJ, Mockito y Testcontainers |

### Calidad

| Comprobación | Comando | Estado |
| --- | --- | --- |
| Tipos | `npm run typecheck` | 0 errores |
| Lint | `npm run lint` | 0 errores |
| Build | `npm run build` | compila |
| Tests de la tienda | `npm test` | 38 tests, 38 pasan |
| Tests de la API | `npm run test:api` | 54 tests, 52 pasan y 2 se saltan sin Docker |

Todo corre en GitHub Actions en cada push (`.github/workflows/`).

---

## 🚀 Demo

- **Tienda pública:** `/products`, `/products/[slug]`, categorías, wishlist,
  lookbook, guía de tallas, contacto y newsletter
- **Cuenta:** registro, login, perfil e historial de pedidos
- **Panel:** `/admin` → dashboard, productos, categorías, inventario, pedidos y
  usuarios

### Cuentas demo (login en `/login`)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Admin | `admin@giborsec.com` | `admin123` |
| Admin | `carolina@example.com` | `carolina123` |
| Soporte | `soporte@giborsec.com` | `soporte123` |
| Cliente | `carlos@example.com` | `carlos123` |
| Cliente | `sofia@example.com` | `sofia123` |

> Contraseñas con **hash scrypt** y comparación con `crypto.timingSafeEqual`,
> nunca en texto plano.

---

## 🗂️ Arquitectura

```
app/
  (shop)/        → rutas públicas: home, productos, carrito, checkout, perfil
  admin/         → panel (guard de rol en el layout y en proxy.ts)
  api/           → Route Handlers (auth, products, categories, orders, users,
                   contact, newsletter, health)
  components/    → UI reutilizable (layout, product, cart, forms, filters, admin)
  constants/     → CONFIG, rutas, roles, tablas de tallas y composición
  lib/           → db (dos motores), sesión, validación, csv
  services/      → clientes HTTP por dominio
  store/         → Zustand: cart, wishlist, auth, orders, products, categories
  types/         → tipos de la base de datos
  utils/         → orderOwnership (dueño de un pedido)
backend/         → API REST Spring Boot + MongoDB (ver backend/README.md)
data/            → datos en JSON: products, categories, users, orders,
                   subscribers, contactMessages
public/images/   → fotos del catálogo
scripts/         → catalog-images.mjs (pipeline de imágenes)
tests/           → tests de la tienda con el runner nativo de Node
```

### Capa de datos con dos motores

`app/lib/db.ts` es una fachada que elige motor en tiempo de ejecución:

- **Sin `MONGODB_URI`** (por defecto): lee y escribe `data/*.json`, con una
  caché en memoria como fuente de verdad. No hay nada que configurar.
- **Con `MONGODB_URI`**: usa MongoDB o Atlas. La caché se precarga al arrancar
  el servidor y las escrituras se replican en segundo plano.

Cambiar de motor no toca ni una línea de la aplicación.

---

## ⚙️ Scripts

```bash
npm install          # dependencias
npm run dev          # servidor de desarrollo (Turbopack)
npm run build        # build de producción
npm start            # servidor de producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # tests de la tienda (38)
npm run test:api     # tests de la API Spring Boot (54)
npm run images       # pipeline de imágenes del catálogo
```

### Configuración

Copia `.env.example` a `.env.local`. Lo único imprescindible en producción es
`AUTH_SECRET`; sin él la app **se niega a arrancar** en vez de firmar sesiones
con un secreto que está en el repositorio.

### Backend

```bash
cd backend
./mvnw spring-boot:run              # http://localhost:8080
APP_SEED=1 ./mvnw spring-boot:run   # además carga /data en Mongo
```

Documentación de la API, variables y endpoints: **[`backend/README.md`](backend/README.md)**.
Swagger en `http://localhost:8080/swagger-ui.html`.

---

## 🧪 Tests

### Tienda — `npm test`

38 tests con el runner nativo de Node, sin dependencias de testing:

- **`session-token.test.mjs`** — la firma de los tokens: uno válido se verifica,
  uno manipulado no, uno expirado no.
- **`purchase-cycle.test.mjs`** — el ciclo de compra entero contra HTTP real:
  registro, login, cookie de sesión, creación de pedido, descuento de stock,
  umbral de envío gratis, validaciones del carrito, aislamiento de pedidos
  entre clientes, gestión desde el panel y protección de `/admin`.
- **`public-forms.test.mjs`** — newsletter y contacto: que guarden, que validen
  campo a campo, que el honeypot no se note y que las bandejas solo se vean con
  sesión de soporte.

Los datos se copian antes y se restauran después, así que la suite no deja
residuos en `data/`. Corre en serie a propósito: todas las suites comparten
`data/`. Si no hay servidor levantado, levanta el suyo en el puerto `3111` con
un `.next-test` aparte.

### API — `npm run test:api`

54 tests. Los que necesitan MongoDB real usan Testcontainers y **se saltan solos
si no hay Docker**, de modo que la suite funciona en un portátil sin él; en CI,
donde Docker sí está, corren enteros. El detalle de cada suite está en
[`backend/README.md`](backend/README.md#tests).

---

## 🖼️ Imágenes del catálogo

Las fotos se sirven **en local** desde `public/images/`, así que el catálogo no
se rompe si un tercero cambia sus URLs.

`scripts/catalog-images.mjs` las genera de forma reproducible: busca en
[Openverse](https://openverse.org) filtrando por la fuente **StockSnap** (CC0) y
descarta cualquier foto que no supere **dos señales independientes**:

1. debe tener una **etiqueta de prenda** (`denim`, `jeans`, `sweater`…), y
2. no debe tener ninguna **etiqueta de escena** (`grass`, `forest`, `sky`…), para
   que no entren paisajes.

Después normaliza a WebP 1200×1500 con `sharp`. La comparación de palabras es
por palabra completa, no por subcadena, para que `cap` no case dentro de
"back**pack**".

```bash
npm run images          # reasigna fotos usando el pool cacheado
npm run images:harvest  # vuelve a buscar en Openverse
npm run images:report   # mide la cobertura por producto sin descargar nada
```

---

## 🔐 Seguridad

- **Tokens firmados** con HMAC-SHA256 y caducidad de 24 h. El payload no se
  puede alterar sin romper la firma.
- **`AUTH_SECRET` obligatorio en producción**: si falta, la app no arranca.
- **El panel se protege en el servidor**: `proxy.ts` comprueba la cookie antes de
  servir nada de `/admin/*`, y el layout vuelve a comprobar el rol.
- **El perfil nunca toca su propio rol**: `role` e `isActive` no son editables
  desde el perfil, y el correo se valida y se rechaza por duplicado con `409`.
- **Los pedidos tienen dueño por id**, no por correo: cambiar el correo de una
  cuenta no hace desaparecer su historial.
- **La API no confía en el cliente**: el precio se resuelve en el servidor
  contra MongoDB, y el stock se descuenta con una operación atómica que impide
  la sobreventa.

En el backend, además: índices únicos reales en la base de datos, CORS por
configuración, y el catálogo público no expone productos dados de baja.

---

## 📦 Deploy

La web se despliega en **Netlify** y la API en **Render**, ambas contra
**MongoDB Atlas**.

### 1. Frontend — Netlify

1. **Add new site → Import an existing project** → elegir este repo. Netlify
   detecta Next.js y usa `netlify.toml` (build `npm run build`, Node 22,
   runtime oficial de Next) sin tocar nada más.
2. **Site configuration → Environment variables**:

   | Variable | Valor |
   | --- | --- |
   | `AUTH_SECRET` | `openssl rand -hex 32` (obligatoria: sin ella el build de producción se niega a arrancar) |
   | `NEXT_PUBLIC_SITE_URL` | `https://<tu-sitio>.netlify.app`, sin barra final |
   | `MONGODB_URI` | URI de Atlas (ver abajo); sin ella newsletter y contacto no persisten porque el filesystem de las functions es de solo lectura |
   | `NEXT_PUBLIC_API_URL` | *(opcional)* origen del backend Spring, p. ej. `https://esencial-api.onrender.com`. Si se omite, la web entera corre con la mini API de Next incluida en el repo |
   | `API_URL` | *(opcional)* lo mismo, pero solo para el servidor (route handlers y server components) |

   Las `NEXT_PUBLIC_*` se inyectan **en build**: define las variables antes del
   primer deploy y vuelve a desplegar (`Clear cache and deploy site`) si cambias.
3. Push a `main`: Netlify redespliega solo. Los tests E2E y el build ya
   corren en los workflows de GitHub Actions (`.github/workflows/`).

### 2. Backend — Render

1. **New → Blueprint** → elegir este repo: `render.yaml` crea el servicio
   `esencial-api` (Java 21, build Maven, arranque del JAR).
2. Define los secrets: `MONGO_URI` (Atlas), `CORS_ALLOWED_ORIGINS` con el
   dominio del front (`https://<tu-sitio>.netlify.app`) y `JWT_SECRET`
   (Render lo genera solo con `generateValue: true`).
3. El health check es `/api/health`, que devuelve `503` si MongoDB no
   responde: es lo que Render usa para sacar de rotación una instancia caída.
4. El seeder (`APP_SEED=1`, ya fijado en el blueprint) carga el catálogo y
   las cuentas de prueba (`admin@esencial.test` / `password123`) en el primer
   arranque.

### 3. MongoDB Atlas

1. [Atlas](https://www.mongodb.com/atlas) → crear cluster **M0** (gratis).
2. **Database Access** → usuario y contraseña.
3. **Network Access** → `0.0.0.0/0` (o las IPs de Render/Netlify).
4. **Connect → Drivers** → copiar la URI y definirla como `MONGODB_URI` en
   Netlify y `MONGO_URI` en Render (ambas con `<db_password>` resuelto).
5. **Sembrar el catálogo** (idempotente, se puede repetir):

   ```bash
   MONGODB_URI="mongodb+srv://..." node scripts/seed-mongo.mjs
   ```

   Sin este paso la tienda arranca con las colecciones vacías al activar el
   motor de Mongo. Si el DNS local bloquea consultas SRV, usa la URI
   `mongodb://` (sin `+srv`) que da **Connect → Drivers → Advanced**.

### Alternativa: solo Netlify (sin backend Java)

Con `MONGODB_URI` definida y **sin** `NEXT_PUBLIC_API_URL`, la web es
autosuficiente: los route handlers de Next persisten en Atlas y no hace
falta desplegar Spring ni Render. El modo integrado añade encima el catálogo
y los pedidos reales de la API Java.

### Docker (pila completa local)

```bash
docker compose up --build   # tienda :3000 · API :8080 · MongoDB
```

---

## 📊 Estado del proyecto

**Listo:**

- Tienda pública completa: catálogo, filtros, búsqueda, carrito, checkout,
  wishlist, lookbook, formularios de contacto y newsletter.
- Panel de administración con productos, categorías, inventario, pedidos y
  usuarios.
- Autenticación con sesiones firmadas y panel protegido en el servidor.
- API REST en Spring Boot con 27 endpoints, JWT, Swagger y 70 tests.
- **Integración front ↔ Spring completada**: servicios de productos,
  categorías, pedidos y usuarios hablan con Spring vía `NEXT_PUBLIC_API_URL`
  (y vuelven a la mini API de Next si no se define), BFF de auth dual en
  `/api/auth/*` (JWT de Spring + cookie HMAC de Next), `GET /api/admin/products`
  para el panel, contratos de `category`/`paymentStatus` alineados y
  recuperación de contraseña también en Spring.
- Server components (portada, categorías, ficha de producto, sitemap) leídos
  desde la capa de servicios con ISR de 60 s / 1 h.
- CI que corre tipos, lint, tests y build de las dos partes.
- Artefactos de despliegue: `netlify.toml`, `Dockerfile` (front),
  `backend/Dockerfile`, `docker-compose.yml`, `render.yaml` y guía de Atlas.

---

## 📄 Licencia

MIT.
