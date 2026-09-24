# Esencial — Tienda de moda minimalista (Next.js)

E-commerce completo de moda minimalista, construido como parte del aprendizaje de **Next.js**. El proyecto integra una tienda pública, panel de administración, autenticación, carrito/checkout, órdenes y un carrito de compras persistente — todo sobre una arquitectura limpia lista para producción.

> ⚠️ **Nota de lectura:** la carpeta de componentes es `app/compents/` (typo intencional heredado y aliasado vía `@/*` → `app/*`). Mantener el nombre original era lo correcto para no romper referencias legacy del tutorial.

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
| Calidad | ESLint (React Compiler rules), `next build` ✓ 0 errores |

## 🚀 Demo

- **Tienda pública:** `/products`, `/products/[slug]`, categorías, búsqueda, wishlist
- **Cuenta:** registro, login, perfil, historial de órdenes
- **Admin:** `/admin` — dashboard, productos, inventario, órdenes, usuarios, categorías

### Cuentas demo (login en `/login`)

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@giborsec.com` | `admin123` |
| Cliente | `carlos@example.com` | `carlos123` |

> Las contraseñas se almacenan con **hash scrypt** (`lib/scrypt.ts`), nunca en texto plano. El login valida contra la "DB" en `data/users.json`.

## 🗂️ Arquitectura

```
app/
  (shop)/        → rutas públicas: home, productos, carrito, checkout, perfil
  admin/         → panel administrativo (protegido por rol)
  api/           → Route Handlers (auth, products, categories, orders, users)
  compents/      → UI reutilizable (layout, product, cart, forms, filters, admin)
  constants/     → CONFIG centralizado (marca, paginación, enlaces)
  lib/           → db (caché en memoria), auth, axios, utils
  services/      → capa de datos (product, category, order, user, auth)
  store/         → Zustand: cart, wishlist, auth, orders, products, categories, theme
  types/         → tipos compartidos
data/            → "base de datos" JSON (products, categories, users, orders)
```

**Persistencia resiliente:** `lib/db.ts` lee/escribe `data/*.json` y mantiene una **caché en memoria** que actúa como fuente de verdad. Si el filesystem es de solo lectura (hosting), las escrituras se conservan en memoria durante la sesión — ideal para demo/portafolio sin necesidad de configurar una DB externa.

## ⚙️ Scripts

```bash
npm install      # deps
npm run dev      # dev server (Turbopack)
npm run build    # producción (pasa el gate del deploy)
npm start        # servidor de producción
npm run lint     # ESLint (0 errores)
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

## ✅ Estado

- `next build`: **compila sin errores** (gate de deploy superado).
- ESLint: **0 errores** (warnings menores de hidratación de Zustand persist, patrón intencional y documentado en `eslint.config.mjs`).
- Repositorio versionado y actualizado (`git`).
