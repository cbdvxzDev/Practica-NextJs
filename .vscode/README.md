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
