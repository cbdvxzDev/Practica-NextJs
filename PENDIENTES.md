# Pendientes para completar el proyecto

> Auditoría realizada el 02/10/2026 sobre el estado actual del repo.
> Verificación en verde: `npm run typecheck` (0 errores) · `npm run lint` (0 errores) · `npm test` (44/44) · `./mvnw test` (54 tests, 0 fallos, 2 saltados sin Docker).
> Última verificación: **06/10/2026 — P0, P1, P2 y P3 completados** (ver §4).
> Verificación del 06/10/2026: typecheck ✓ · lint ✓ · `npm test` 44/44 ✓ · `npm run build` verde (**49 rutas**, ISR 60 s/1 h) ✓ · `./mvnw -B test` **70 tests, 0 fallos** (2 saltados sin Docker) ✓.

---

## 1. Estado por área

| Área | % | Estado |
| --- | --- | --- |
| Catálogo público (`/products`, `[slug]`, categorías, filtros, búsqueda, wishlist, lookbook) | 95% | Completo: filtros por URL, sort, paginación, galería, tallas, relacionados, skeletons, SEO |
| Carrito (drawer + `/cart`) | 95% | Store persistido, límite por stock, progreso de envío gratis |
| Checkout (`/checkout` + success) | 92% | Crea pedido real con precios/envío calculados en servidor, dirección estructurada y pago simulado (tarjeta o contra entrega). Falta pasarela real |
| Autenticación (login/registro/logout/perfil) | 95% | Token + cookie httpOnly, guards de `proxy.ts` en `/admin`, `/checkout` y `/profile`, y recuperación de contraseña completa |
| Admin · Dashboard | 90% | Stats reales, export CSV, alerta de stock bajo |
| Admin · Productos | 90% | CRUD completo, `isActive` activar/desactivar. Falta subida de imágenes (solo URLs) |
| Admin · Categorías | 85% | CRUD y refresco del store tras crear/editar (P1.3) |
| Admin · Inventario | 85% | Tabla + alertas + etiquetas SKU y ajuste real de stock (P1.5) |
| Admin · Pedidos | 90% | Listado con filtros/CSV y cambio de estado. Sin cancelación ni cambio de pago |
| Admin · Usuarios | 90% | Lista en Zustand y ficha con cambio de rol y alta/baja de cuentas (protegido contra auto-baja) |
| Responsive | 90% | Breakpoints por todo el proyecto, hamburger, drawer de filtros, sidebar móvil, tablas con scroll |
| Zustand | 95% | 7 stores: cart, wishlist, auth, product, category, order, user |
| Integración Spring Boot + MongoDB Atlas | 100% | ✅ Servicios → Spring vía `NEXT_PUBLIC_API_URL`, BFF de auth dual, contratos alineados, server components con ISR y artefactos de deploy (06/10/2026) |
| **Global** | **~88%** | |

---

## 2. Errores detectados

### P0 — Bloqueantes

1. **`backend/src/main/java/com/esencial/api/seed/CatalogSeeder.java` NO COMPILA** (fichero modificado sin commit, migración Jackson 2 → 3 incompleta):
   - `:60,70,78` el campo se renombró a `jsonMapper` pero `:179` (`objectMapper.convertValue(...)`) y `:184` (`objectMapper.readValue(...)`) siguen usando el nombre viejo → `objectMapper cannot be resolved`.
   - `:185` `catch (IOException ex)` sin `import java.io.IOException` (se quitó en el diff) → `IOException cannot be resolved`.
   - `:28` importa `tools.jackson.core.JacksonException` y no se usa.
   - Impacto: `./mvnw test` y `./mvnw package` fallan en compilación → **`backend.yml` de GitHub Actions roto y nunca hay JAR**. La clase `.class` generada por Eclipse es un stub con el error incrustado: fallaría `java.lang.Error` al cargar.
   - Arreglo mínimo: usar `jsonMapper` en L179/L184, re-añadir `import java.io.IOException;`, quitar el import de `JacksonException`.
   - **✅ RESUELTO 02/10/2026**: los 4 cambios aplicados y `./mvnw -B test` en verde (54 tests, 0 fallos, 2 saltados sin Docker).

### P1 — Bugs funcionales del frontend ✅ (todos resueltos 02/10/2026)

| # | Bug | Archivo:línea |
| --- | --- | --- |
| 1 | Los pedidos no se cargan tras iniciar sesión en la misma sesión del navegador (hasta pulsar F5): `fetchOrders()` solo se ejecuta si había sesión al montar y `hydrated.current` lo bloquea | `app/components/providers/ShopDataProvider.tsx:33-36` |
| 2 | 404 intermitente en `/profile/orders/[id]`: no espera a `loading` del store antes de pintar "Orden no encontrada" (el equivalente admin sí lo hace) | `app/(shop)/profile/orders/[id]/page.tsx:44-76` |
| 3 | Categorías creadas/editadas no aparecen en la lista: se llama a `CategoryService` directamente en vez del store | `app/admin/categories/create/page.tsx:16`, `app/admin/categories/edit/[id]/page.tsx:33` |
| 4 | Rol `support` roto en el panel: `AdminDataProvider` solo hidrata `orders` para ese rol → productos/inventario/dashboard vacíos, y `/admin/users` devuelve 403 en rojo | `app/components/providers/AdminDataProvider.tsx:57-63` |
| 5 | Inventario no editable de verdad: "Ajustar" solo hace `stock + 1` (sin input para fijar una cantidad) | `app/components/admin/InventoryTable.tsx:64` |
| 6 | Imposible desactivar/publicar un producto (`isActive` no se muestra ni se edita) y el badge de estado miente, mirando solo `stock` | `app/admin/products/page.tsx:66-76`, `app/components/forms/ProductForm.tsx` |
| 7 | El guard de `/checkout` y `/profile` es solo client-side; `proxy.ts` únicamente protege `/admin` (`PROTECTED_ROUTES` de `routes.ts` es código muerto) | `app/proxy.ts:43-47`, `app/constants/routes.ts:33-50` |
| 8 | Home, índice de categorías y sitemap quedan congelados tras un alta desde el panel (prerender sin revalidate) | `app/(shop)/page.tsx`, `app/(shop)/categories/page.tsx`, `app/sitemap.ts` |
| 9 | El menú del panel no aparece para `support` (`isAdmin` solo admite `admin`), aunque `safeNextPath` sí lo lleva allí | `app/components/layout/Navbar.tsx:117` |
| 10 | El perfil muestra "Cliente" a un usuario `support` | `app/(shop)/profile/page.tsx:115` |
| 11 | Contador de artículos del carrito usa el número de líneas (`items.length`) en vez de la suma de unidades | `app/(shop)/cart/page.tsx:44`, `app/components/cart/CartDrawer.tsx:80` |
| 12 | Conflicto de bloqueo de scroll: el drawer fuerza `overflow: unset` y pisa el bloqueo del menú móvil | `app/components/cart/CartDrawer.tsx:40-46` |
| 13 | Tipo del store de pedidos sin `size` en `items`, aunque checkout y servicio sí lo envían | `app/store/order.store.ts:30` |
| 14 | Latencias falsas con `setTimeout` (700 ms en el formulario de producto, 800 ms en el resumen del carrito): el botón se resetea antes de que termine el guardado | `app/components/forms/ProductForm.tsx:107-110`, `app/components/cart/CartSummary.tsx:34-37` |
| 15 | `logout` con doble navegación (`window.location.href` + `router.push`) | `app/services/auth.service.ts:74`, `app/admin/layout.tsx:38-41` |

### P2 — Código muerto / limpieza ✅ (todos resueltos 02/10/2026)

- `app/services/user.service.ts:57` → `updateUser` nunca se usa desde la UI. **✅** Ahora lo consume la ficha de usuario.
- Componentes sin consumidor: `admin/DashboardCard.tsx`, `admin/ProductTable.tsx`, `admin/SidebarAdmin.tsx`, `common/EmptyState.tsx`, `common/ErrorMessage.tsx`, `common/Loader.tsx`, `layout/Container.tsx`, `product/ProductInfo.tsx`, `ui/Card.tsx`, `ui/Spinner.tsx`. **✅** Los 10 borrados.
- Duplicidad: dos implementaciones de `Skeleton` (`ui/Skeleton.tsx` y `ui/Skeletons.tsx`). **✅** `ui/Skeleton.tsx` borrado y sus 2 consumidores (`admin/orders/[id]`, `admin/products/edit/[id]`) apuntan a `ui/Skeletons`.
- Tipos sin usar: `NewOrder` (`order.store.ts:8`), `useProductBySlug` (`product.store.ts:78`), `ProductType` (`product.service.ts:113`). **✅** Los 3 borrados.
- No existe `/profile/orders` (solo `[id]`) → 404 si se aterriza ahí. **✅** Ruta creada (lista con `OrderList`, compartido con el perfil).
- No hay `TODO`/`FIXME` en el código.

---

## 3. Faltantes frente a los requisitos del proyecto

### Requisito 2 — Panel admin con Zustand y componentes reutilizables

- [x] **Gestión de usuarios**: crear `app/store/user.store.ts`, conectar `UserService.updateUser` (`app/services/user.service.ts:57`) en `app/admin/users/[id]/page.tsx` para cambiar rol y activar/desactivar cuentas (la ruta `PATCH /api/users/[id]` ya existe).
- [x] Mover la lista de usuarios de `useState` a Zustand (`app/admin/users/page.tsx:16-30`).
- [x] Refrescar `useCategoryStore` tras crear/editar (hueco P1.3).
- [x] Ajuste real de inventario: input/stepper para fijar cantidad en lugar de `+1` (hueco P1.5).
- [x] Exponer `isActive` en `ProductForm` y en el badge del listado (hueco P1.6).

### Requisito 3 — Checkout y auth (interfaz)

- [x] Formulario de pago (o al menos una interfaz de pasarela simulada): hoy el servidor marca `paymentStatus: "paid"` siempre. **✅** Tarjeta (valida número/vencimiento/CVC) o contra entrega; el cliente envía `paymentStatus` y el servidor solo admite `paid`/`pending`.
- [x] Dirección de envío estructurada (ahora es un solo campo libre). **✅** 8 campos con autocompletado del navegador que se envían como un texto ordenado a la API.
- [x] Recuperación de contraseña (hoy solo hay un `mailto:` en `LoginForm.tsx:72-77`). **✅** `/forgot-password` + `/reset-password` con token hasheado y caducidad de 15 min, sin filtrar la base de correos.
- [x] Proteger `/checkout` y `/profile` en el servidor (`proxy.ts`), no solo en cliente (hueco P1.7).

### Requisito 4 — Arquitectura preparada para Spring Boot + MongoDB Atlas ✅ (06/10/2026)

Estado: **integrado y verificado.** Diseño híbrido: el navegador habla con
Next (BFF + mini API) y Next habla con Spring cuando hay backend remoto.

- [x] **Cablear `NEXT_PUBLIC_API_URL`**: `app/lib/api-url.ts` (`apiUrl()`/`hasRemoteApi()`), base remota solo si es `http(s)://`; los servicios de productos, categorías, pedidos y usuarios/perfil la usan. Documentado en `.env.example`.
- [x] **Unificar autenticación**: **dos tokens** (sin compartir secreto). El BFF de `/api/auth/*` (login/register/me/forgot/reset) reenvía a Spring con `forwardAuth` y guarda su JWT en la cookie `esencial_session` que ya valida `proxy.ts` (HMAC de Next, `session-token.ts` intacto). Logout stateless (borra cookie + localStorage; Spring no tiene endpoint).
- [x] **Cookie de sesión para `proxy.ts`**: resuelto por el punto anterior; `AUTH_SECRET` y `JWT_SECRET` ya no tienen por qué ser el mismo.
- [x] **Ajustar contratos**: `resolveCategoryInput` (`app/lib/category-input.ts`) normaliza categoría objeto/slug/id → `ProductRequest.category` slug; `CreateOrderRequest.paymentStatus` con `@Pattern("paid|pending")` en Spring y alineado en checkout; forgot/reset-password en Spring (token sha256, TTL 15 min).
- [x] **Listado admin**: `GET /api/admin/products` (inactivos incluidos, `ADMIN`+`SUPPORT`) con route handler local `app/api/admin/products/route.ts` y flag `admin` en `fetchProducts`/`product.service` (store y `AdminDataProvider`).
- [x] **Endpoints que faltan en Spring**: newsletter y contact se quedan en Next (Spring no los tiene; persisten con `MONGODB_URI`); logout = borrar cookie, stateless.
- [x] **Server components directos a la BD**: portada, categorías, `[slug]` de categoría, `[slug]` de producto y `sitemap.ts` leen `app/lib/server-api.ts` (Spring con ISR 60 s/1 h y fallback a la mini base local). **✅ Resuelto 06/10/2026.**
- [x] Tests: los 44 de integración siguen en verde sin `NEXT_PUBLIC_API_URL` (mini API intacta); backend subido a **70 tests** (AuthServiceTest nuevo + OrderSecurityTest/CatalogSecurityTest ampliados).

### Pendiente extra del README — Deploy ✅ (06/10/2026)

- [x] Atlas: guía paso a paso en README §Deploy (URI para Netlify `MONGODB_URI` y Render `MONGO_URI`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`).
- [x] `AUTH_SECRET` y `NEXT_PUBLIC_SITE_URL` documentadas en `netlify.toml` y `.env.example`.
- [x] Artefactos de despliegue creados: `netlify.toml` (runtime Next oficial), `Dockerfile` + `.dockerignore` (front), `backend/Dockerfile`, `docker-compose.yml` (mongo + api + web), `render.yaml` (blueprint Java), `backend/.env.example`. CI ya existía (`frontend.yml`, `backend.yml`); Netlify redespliega desde Git en cada push a `main`.

---

## 4. Checklist priorizado

### P0 — Que nada esté roto ✅ (02/10/2026)
- [x] Arreglar `CatalogSeeder.java` (L179/L184 `jsonMapper`, import `IOException`, quitar `JacksonException`) y verificar con `cd backend && ./mvnw test`.
- [x] `npm test` en verde.

### P1 — Bugs del frontend (§2.1) ✅ (02/10/2026)
- [x] Pedidos tras login sin F5 (#1) y 404 de detalle de pedido (#2).
- [x] Refresco de categorías (#3), rol `support` (#4, #9), ajuste de inventario (#5), `isActive` (#6).
- [x] Guards servidor de `/checkout` y `/profile` (#7), revalidate de home/sitemap (#8).
- [x] Resto de bugs menores (#10–#15).
- Verificado en verde: `typecheck` · `lint` · `npm test` (38/38) · `build` (02/10/2026).

### P2 — Requisitos incompletos ✅ (02/10/2026)
- [x] Admin de usuarios completo con `user.store.ts`.
- [x] Checkout con pago simulado + dirección estructurada + recuperación de contraseña.
- [x] Limpiar código muerto (§2.2).
- Verificado en verde: `typecheck` · `lint` · `npm test` (44/44, 6 de ellas nuevas en `tests/password-reset.test.mjs`) · `build` (02/10/2026).

### P3 — Integración y deploy ✅ (06/10/2026)
- [x] Cablear `NEXT_PUBLIC_API_URL` + BFF de auth dual (JWT Spring + cookie HMAC Next).
- [x] Ajustar contratos (category slug, admin products, paymentStatus, reset en Spring).
- [x] Migrar server components a la capa de servicios (`app/lib/server-api.ts`).
- [x] Artefactos de deploy Netlify/Render/Docker + guía Atlas en README.
- Verificado en verde (06/10/2026): `typecheck` · `lint` · `npm test` (44/44) · `build` (49 rutas) · `./mvnw -B test` (70 tests, 0 fallos).

---

## 5. Comandos de verificación

```bash
npm run typecheck    # tipos        → 0 errores ✓
npm run lint         # ESLint       → 0 errores ✓
npm test             # tests de la tienda → 44/44 ✓ (06/10/2026)
cd backend && ./mvnw test   # tests Java → 70, 0 fallos (2 se saltan sin Docker) ✓ (06/10/2026)
npm run build        # build de producción → en verde ✓ (06/10/2026, 49 rutas)
```
