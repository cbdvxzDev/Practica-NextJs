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

## Por que hay un aviso silenciado

`settings.json` ignora el problema `67109822` del analizador de JDT. Es el
"Null type safety" que salia en tres sitios con metodos-referencia:

- `UserService`, con `User::isActive` sobre un `Optional<User>`.
- `ProductService`, con `String::trim` justo detras de un `filter` que ya
  descarta los null.
- `SecurityConfig`, con `AbstractHttpConfigurer::disable`, que es el patron que
  documenta Spring Security.

En ninguno hay un nulo posible; lo que ocurre es que Spring anota sus APIs con
`@NonNull` y JDT interpreta esa anotacion como una promesa que la referencia a
metodo incumple.

Se silencia ese ID en concreto y **no** se desactiva `java.compile.nullAnalysis`,
para que un posible NullPointerException de verdad siga marcandose. Si prefieres
verlos, quita el bloque `"[java]"` y reescribe las tres referencias como
lambdas explicitas, que JDT no se queja de esas.
