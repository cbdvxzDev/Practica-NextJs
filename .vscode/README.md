# Ajustes de editor

Este proyecto es un monorepo: la raiz es la tienda de Next.js y dentro esta
`backend/`, que es un proyecto Maven de Spring Boot independiente.

## Si los errores de Java aparecen en rojo

Casi siempre es que la extension de Java no sabe donde esta el JDK. Compruebalo
en **Settings → Languages → Java → Home** (o en el menu de Java: *Configure Java
Runtime*). Debe apuntar a un **JDK 21**, no a un JRE y no al JetBrains Runtime
embebido, porque el proyecto compila con `release 21`.

Si no tienes JDK 21, en `Settings → Languages → Java → Home → Edit` se anade.
Un JDK 17 o 11 da errores en todo el proyecto porque el codigo usa sintaxis y
librerias de 21.

## Dónde se guarda cada cosa

- `settings.json` (este archivo) lleva solo ajustes portables, sin rutas de disco.
  Por eso **no** fija el JDK: una ruta absoluta versionada rompe el proyecto al
  resto. El JDK se configura en los ajustes de usuario de VS Code.
- La configuracion de IntelliJ (`.idea/`, `*.iml`) esta en `.gitignore` por lo
  mismo.

## Maven

Usa el wrapper del propio proyecto, `backend/mvnw`, en lugar de un Maven global:
asi el editor y la terminal compilan con la misma version. En
**Settings → Java → Build Tools → Maven → Maven home** elige *Maven Wrapper*.

## Tests

`Java: Run All Tests` usa el launcher de JUnit nativo. Los tests de la API que
necesitan MongoDB (Testcontainers) se **saltan solos** si no hay Docker; en un
portatil sin Docker es lo esperado, y en CI corren enteros.

## Los tres avisos de nulabilidad

Tres avisos "Null type safety: parameter 'this' needs unchecked conversion to
conform to @NonNull" aparecian en metodos-referencia:

- `UserService`, con `User::isActive` sobre un `Optional<User>`.
- `ProductService`, con `String::trim` justo detras de un `filter` que ya
  descarta los null.
- `SecurityConfig`, con `AbstractHttpConfigurer::disable`, que es el patron que
  documenta Spring Security.

No hay ningun nulo posible en ninguno de los tres: el primero sale de un
`Optional`, el segundo va filtrado y el tercero es un configurer que Spring
siempre pasa. Se resolvieron escribiendo las tres como lambdas explicitas, que
no pasan por el descriptor de metodo y por tanto no disparan el aviso. El
comportamiento es identico.

Que solosaltaran esas tres y no las demas referencias del proyecto, como
`UserResponse::from` o `ProductResponse::from`, es la pista: esas apuntan a
metodos propios sin anotaciones, y las que avisaban son las que tocan APIs
anotadas por Spring.

**Si alguna vez vuelven, y se han probado dos vias que no funcionan**, esta es la
cuenta:

- `editor.diagnostics.severity` con el ID `67109822` no sirve: la extension no
  respeta ese ajuste para los avisos del analizador de nulabilidad.
- Quitar `org.springframework.lang.NonNullApi` de
  `java.compile.nullAnalysis.nonnullbydefault` no sirve. Era una teoria
  razonable (Spring lo declara en el `package-info` de sus paquetes y JDT lo
  lee como "todo esto es no nulable"), pero el aviso sigue saliendo igual, asi
  que no se dejo puesto.

Queda una tercera via, que es la que de verdad funciona pero tiene un coste
real: poner `"java.compile.nullAnalysis.mode": "disabled"`. Con eso desaparecen
todos los avisos de nulabilidad del proyecto, no solo estos tres, y a cambio se
pierde la deteccion de NullPointerException posibles. No se ha aplicado porque
cinco avisos falsos no justifican renunciar a esa comprobacion.
