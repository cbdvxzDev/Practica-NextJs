# Esencial API

API REST del backend de la tienda **Esencial**, en Spring Boot 4 sobre MongoDB.
Sirve el catálogo, la autenticación con JWT, los pedidos y el panel de
administración.

- **Java** 21 · **Spring Boot** 4.1.1 · **MongoDB** · **Maven**
- Seguridad con `spring-boot-starter-oauth2-resource-server` (JWT HS256) y BCrypt
- Documentación interactiva en `/swagger-ui.html`

## Arrancar en local

```bash
cd backend
./mvnw spring-boot:run
```

Sin más configuración arranca en `http://localhost:8080` con MongoDB en
`mongodb://localhost:27017/esencial`. Si no hay ninguna base de datos a la que
conectarse, las rutas que no dependen de datos (health, auth) siguen
respondiendo; el resto fallarán al leer.

### Sembrar el catálogo de prueba

Arranca vacío salvo que se pida sembrar. Con `APP_SEED=1` carga desde `../data`
las 9 categorías, los 48 productos y las 6 cuentas de demostración, re-hasheando
las contraseñas con BCrypt:

```bash
APP_SEED=1 ./mvnw spring-boot:run
```

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `admin@giborsec.com` | `esencial2026` | admin |
| `carolina@example.com` | `esencial2026` | admin |
| `carlos@example.com` | `esencial2026` | customer |
| `sofia@example.com` | `esencial2026` | customer |
| `soporte@giborsec.com` | `esencial2026` | support |

El sembrado solo hace falta si la colección está vacía: si ya hay datos no
sobrescribe nada.

## Variables de entorno

| Variable | Por defecto | Para qué |
| --- | --- | --- |
| `MONGO_URI` | `mongodb://localhost:27017/esencial` | Cadena de conexión. En producción, la de Atlas. |
| `JWT_SECRET` | valor de desarrollo | Clave de firma. **Obligatoria en producción**, mínimo 32 caracteres. |
| `JWT_TTL` | `24h` | Vigencia del token. |
| `PORT` | `8080` | Puerto. Lo sobreescribe la plataforma de despliegue. |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Orígenes permitidos, separados por comas. |
| `APP_SEED` | `false` | `1` habilita el sembrado inicial. |
| `APP_SEED_DATA_DIR` | `../data` | Carpeta de los JSON del sembrado. |

`JWT_SECRET` con menos de 32 caracteres hace fallar el arranque: HS256 necesita
256 bits y una clave corta no da esa seguridad.

## Endpoints

### Público (sin token)

| Método | Ruta | Qué hace |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Devuelve un JWT y el usuario. |
| `POST` | `/api/auth/register` | Crea una cuenta de cliente. `201`. |
| `GET` | `/api/health` | Comprueba que la API responde y que MongoDB contesta. |
| `GET` | `/api/products` | Catálogo. Filtros `?category=` y `?search=`. |
| `GET` | `/api/products/slug/{slug}` | Ficha de un producto activo. |
| `GET` | `/api/products/{id}` | Ficha de un producto activo. |
| `GET` | `/api/categories` · `/api/categories/{id}` | Categorías. |

### Con sesión

| Método | Ruta | Rol | Qué hace |
| --- | --- | --- | --- |
| `GET` | `/api/auth/me` | cualquiera | Usuario del token. |
| `GET` | `/api/orders` | cualquiera | El cliente ve solo los suyos; staff, todos. |
| `GET` | `/api/orders/{id}` | dueño o staff | Detalle de un pedido. |
| `POST` | `/api/orders` | cualquiera | Crea un pedido desde el carrito. |
| `GET` | `/api/user/profile` | cualquiera | Perfil propio. |
| `PUT` | `/api/user/profile` | cualquiera | Edita nombre, correo y avatar. |

### Panel (admin)

| Método | Ruta | Qué hace |
| --- | --- | --- |
| `GET` | `/api/admin/products` | Todos los productos, **incluidos los dados de baja**. |
| `GET` | `/api/admin/products/{id}` | Cualquier producto, activo o no. |
| `POST` | `/api/products` | Crea un producto. `201`. |
| `PUT` | `/api/products/{id}` | Sustituye el producto. |
| `PATCH` | `/api/products/{id}/stock` | Ajusta el stock. |
| `DELETE` | `/api/products/{id}` | Elimina un producto. |
| `POST` `PUT` `DELETE` | `/api/categories[/{id}]` | Gestión de categorías. |
| `PATCH` | `/api/orders/{id}/status` | Cambia el estado, respetando las transiciones válidas. |
| `GET` | `/api/users` · `/api/users/{id}` | Cuentas; el detalle incluye sus pedidos. |
| `PATCH` | `/api/users/{id}` | Nombre, rol y activación. |

La vista de gestión del catálogo vive bajo `/api/admin/products` y no dentro de
`/api/products` a propósito: las reglas de seguridad hacen público
`GET /api/products/*`, y cualquier ruta de gestión colocada ahí quedaría captada
por ese comodín.

### Formato de respuesta

```jsonc
// Exito con lista
{ "data": [ ... ], "meta": { "total": 48 } }
// Exito con un objeto
{ "data": { ... } }
// Error
{
  "timestamp": "2026-09-28T15:43:45Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Revisa el formulario antes de enviarlo.",
  "details": { "title": "El título es obligatorio" }
}
```

## Reglas de negocio

- **El precio se resuelve siempre en el servidor.** `POST /api/orders` ignora
  cualquier importe que venga en el cuerpo y lee el de MongoDB, para que un
  cliente no pueda pagar lo que quiera.
- **No hay sobreventa.** El descuento de stock se hace con un `findAndModify`
  que incluye `stock >= cantidad` dentro del propio filtro, no leyendo y
  restando después. Si una línea falla, se devuelve el stock ya descontado.
- **Los identificadores de pedido son consecutivos** (`ORD-2026-001`) mediante un
  contador en la colección `counters`, no contando documentos: contar elementos
  reutiliza ids en cuanto uno se borra.
- **Los pedidos tienen dueño por id, no por correo.** Así, cambiar el correo de
  una cuenta no hace desaparecer su historial.
- **Las transiciones de estado están acotadas.** `pending → processing →
  shipped → delivered`, y se puede cancelar hasta que sale. Un salto inválido es
  un 400.
- **Envío gratis** a partir de 200.000 COP; si no, 12.000 COP.
- **Al cancelar se devuelve el stock.**

## Tests

```bash
./mvnw test
```

54 tests. Los que necesitan MongoDB real usan Testcontainers y **se saltan
solos si no hay Docker**, de modo que la suite es ejecutable en un portátil sin
él; en CI, donde Docker sí está, corren enteros.

| Suite | Qué cubre |
| --- | --- |
| `SlugsTest` | Generación de slugs desde títulos con acentos y símbolos. |
| `OrderStatusTest` | Transiciones válidas y valores admitidos. |
| `InventoryServiceTest` | Que el filtro de stock vaya en la consulta y la compensación. |
| `RoleTest` | Roles aceptados y rechazados, y serialización en minúsculas. |
| `ProductVisibilityTest` | Que un producto dado de baja no se encuentre en la ruta pública pero sí en la del panel. |
| `CatalogSecurityTest` | La frontera pública/privada del catálogo contra el `SecurityFilterChain` real. |
| `OrderSecurityTest` | El rol se resuelve del claim, un cliente no toca lo ajeno, y los errores de entrada son 400 y no 500. |
| `EsencialApiApplicationTests` | El contexto arranca y los repositorios responden. Requiere Docker. |

## Notas de implementación

- **Los índices únicos se crean solos.** `auto-index-creation` está activo, así
  que el `@Indexed(unique = true)` de email, sku y slug es una garantía de la
  base de datos y no solo una comprobación en el código.
- **El JSON es estricto.** `allow-coercion-of-scalars` está desactivado: un
  entero donde va un booleano (`{"isActive": 42}`) es un 400, no un `true`
  silencioso.
- **Emisión y validación comparten clave.** La clave del JWT se deriva una vez en
  un bean `SecretKey` del que reciben el `JwtEncoder` y el `JwtDecoder`, así que
  no pueden desincronizarse.
- **Dinero en enteros.** Los precios se guardan en centavos (`long`), no en
  `double`. Es lo que evita errores de redondeo en el total.
