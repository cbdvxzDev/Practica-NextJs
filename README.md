# Esencial — Tienda de moda minimalista (Next.js)

E-commerce completo de moda minimalista, construido como parte del aprendizaje de **Next.js**. El proyecto integra una tienda pública, panel de administración, autenticación, carrito/checkout, órdenes y un carrito de compras persistente — todo sobre una arquitectura limpia lista para producción.

---

## 🦊 Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + `cn()` (clsx + tailwind-merge) |
| Estado | Zustand (persistencia en localStorage) + mini API en JSON |
| HTTP | axios (cliente `api.ts`) |
| Iconos | lucide-react |
| Imágenes | sharp (pipeline de catálogo, solo dev) |
| Calidad | ESLint, `tsc --noEmit` y `next build` ✓ 0 errores |

## 🚀 Demo

- **Tienda pública:** `/products`, `/products/[slug]`, categorías, wishlist, lookbook, guía de tallas
- **Cuenta:** registro, login, perfil, historial de órdenes
- **Admin:** `/admin` — redirige a `/admin/dashboard` (dashboard, productos, inventario, órdenes, usuarios, categorías)

### Cuentas demo (login en `/login`)

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@giborsec.com` | `admin123` |
| Admin | `carolina@example.com` | `carolina123` |
| Soporte | `soporte@giborsec.com` | `soporte123` |
| Cliente | `carlos@example.com` | `carlos123` |
| Cliente | `sofia@example.com` | `sofia123` |

> Las contraseñas se almacenan con **hash scrypt** (`hashPassword`/`verifyPassword` en `app/lib/auth.ts`), nunca en texto plano, y se comparan con `crypto.timingSafeEqual`. El login valida contra la "DB" en `data/users.json`.

## 🗂️ Arquitectura

```
app/
  (shop)/        → rutas públicas: home, productos, carrito, checkout, perfil
  admin/         → panel administrativo (protegido por rol en su layout)
  api/           → Route Handlers (auth, products, categories, orders, users)
  components/    → UI reutilizable (layout, product, cart, forms, filters, admin, home, common)
  constants/     → CONFIG, rutas, roles, tablas de tallas y composición de prendas
  hooks/         → useIsMounted (hidratación segura de stores persistidos)
  lib/           → db (caché en memoria), auth (HMAC + scrypt), api, csv, utils
  services/      → capa de datos (product, category, order, user, auth)
  store/         → Zustand: cart, wishlist, auth, orders, products, categories
  types/         → tipos compartidos
  utils/         → helpers (formato de moneda/fecha, slug, validaciones)
data/            → "base de datos" JSON (products, categories, users, orders)
public/images/   → fotos del catálogo (products/, categories/, placeholder.svg)
scripts/         → catalog-images.mjs (pipeline de imágenes del catálogo)
```

**Persistencia resiliente:** `lib/db.ts` lee/escribe `data/*.json` y mantiene una **caché en memoria** que actúa como fuente de verdad. Si el filesystem es de solo lectura (hosting), las escrituras se conservan en memoria durante la sesión — ideal para demo/portafolio sin necesidad de configurar una DB externa.

## 🖼️ Imágenes del catálogo

Las fotos se sirven **en local** desde `public/images/`, no desde un CDN externo, así que el catálogo no se rompe si un tercero cambia sus URLs.

`scripts/catalog-images.mjs` las genera de forma reproducible: busca en [Openverse](https://openverse.org) filtrando por la fuente **StockSnap** (CC0) y descarta cualquier foto que no supere **dos señales independientes**:

1. debe tener una **etiqueta de prenda** (`denim`, `jeans`, `sweater`…), y
2. no debe tener ninguna **etiqueta de escena** (`grass`, `forest`, `sky`, `city`…), para que no entren paisajes.

Después normaliza a WebP 1200×1500 con `sharp` y escribe las rutas en `data/*.json`. La comparación de palabras es por palabra completa, no por subcadena, para que `cap` no CASE dentro de "back**pack**".

```bash
npm run images          # reasigna fotos usando el pool cacheado
npm run images:harvest  # vuelve a buscar en Openverse (~350 peticiones)
npm run images:report   # mide la cobertura por producto sin descargar nada
```

## ⚙️ Scripts

```bash
npm install         # deps
npm run dev         # dev server (Turbopack)
npm run build       # producción (pasa el gate del deploy)
npm start           # servidor de producción
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run images      # pipeline de imágenes (ver arriba)
```

## 📦 Deploy (Vercel)

1. Sube el repo a GitHub:
   ```bash
   git add -A && git commit -m "descripción" && git push
   ```
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Framework se detecta solo (`Next.js`). Build command: `npm run build`. Output: `.next`.
4. **Deploy** → cada push a `main` genera una preview; el merge a producción queda listo.

> Alternativas: Netlify (build `npm run build`, publish `.next`) o cualquier host que ejecute `next start`.

## 🔐 Seguridad

- Tokens firmados con **HMAC-SHA256** y caducidad de 24 h (`app/lib/auth.ts`).
- El panel de admin comprueba el rol (`admin` / `support`) **en el layout**, no solo en la API: un cliente que entre a `/admin/*` es expulsado a `/login`.
- `PUT /api/user/profile` valida el correo, rechaza duplicados con `409` y nunca devuelve `passwordHash`; `role` e `isActive` no son editables desde el perfil.
- El secreto de firma se lee de `AUTH_SECRET`; **defínelo en producción** (hay un valor de desarrollo por defecto).

## ✅ Estado

- `next build`: **compila sin errores** (gate de deploy superado).
- `tsc --noEmit` y ESLint: **0 errores**.
- Repositorio versionado y actualizado (`git`).
