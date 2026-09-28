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

Quedaban tres avisos "Null type safety: parameter 'this' needs unchecked
conversion to conform to @NonNull" en metodos-referencia:

- `UserService`, con `User::isActive` sobre un `Optional<User>`.
- `ProductService`, con `String::trim` justo detras de un `filter` que ya
  descarta los null.
- `SecurityConfig`, con `AbstractHttpConfigurer::disable`, que es el patron que
  documenta Spring Security.

No hay ningun nulo posible en ninguno de los tres. La causa esta en
`java.compile.nullAnalysis.nonnullbydefault`, que por defecto incluye
`org.springframework.lang.NonNullApi`. Spring lo pone en el `package-info` de sus
paquetes, y JDT lo lee como "todo esto es no nulable", de modo que la
anotacion se propaga hasta el codigo propio y una referencia a metodo parece
incumplir la promesa.

La configuracion quita Spring de esa lista. No apaga el analisis de
nulabilidad: el proyecto no usa `@NonNullApi` en ningun sitio, asi que lo unico
que deja de inferir son las anotaciones de Spring, y un
`NullPointerException` posible en codigo propio se sigue marcando.

Un intento anterior de silenciarlos por ID de diagnostico
(`editor.diagnostics.severity` con `67109822`) no funciono: la extension no
respeta ese ID para los avisos del analizador de nulabilidad. Si algun dia
vuelven, la otra via es reescribir las tres referencias como lambdas
explicitas, que no pasan por el descriptor de metodo y esquivan el aviso.
