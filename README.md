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

**Frontend (Vercel o Netlify):** importar el repo, el framework se detecta
solo. Definir `AUTH_SECRET` y `NEXT_PUBLIC_SITE_URL` en las variables de
entorno.

**Backend (Render, Railway o Fly.io):** servicio Node o Java. Definir
`MONGO_URI` (Atlas), `JWT_SECRET` y `CORS_ALLOWED_ORIGINS` apuntando al dominio
del frontend. El endpoint `/api/health` devuelve `503` si MongoDB no responde, que
es lo que usan estas plataformas para sacar de rotación una instancia caída.

---

## 📊 Estado del proyecto

**Listo:**

- Tienda pública completa: catálogo, filtros, búsqueda, carrito, checkout,
  wishlist, lookbook, formularios de contacto y newsletter.
- Panel de administración con productos, categorías, inventario, pedidos y
  usuarios.
- Autenticación con sesiones firmadas y panel protegido en el servidor.
- API REST en Spring Boot con 27 endpoints, JWT, Swagger y 54 tests.
- CI que corre tipos, lint, tests y build de las dos partes.

**Pendiente:**

- Conectar el frontend con la API de Spring Boot (`NEXT_PUBLIC_API_URL` ya está
  preparada; los servicios de `app/services/` aún apuntan a `/api`).
- Desplegar la API y conectar MongoDB Atlas.

---

## 📄 Licencia

MIT.
