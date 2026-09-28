// instrumentation.ts (raiz del proyecto)
//
// Next ejecuta este `register` una vez al arrancar el servidor, antes de que
// atienda la primera peticion. Hace dos cosas:
//
// 1. Abrir la conexion de datos. Con MONGODB_URI definido, la cache en memoria
//    que usa toda la app tiene que estar llena antes de que ninguna ruta la
//    lea; el store de JSON no necesita nada, asi que en el caso por defecto este
//    paso no hace trabajo.
//
// 2. Comprobar que hay un secreto de sesion real. Mientras no se declare uno, la
//    app firma con una constante de desarrollo que esta en el repositorio: con
//    ella, cualquiera que lea el codigo puede fabricarse un token con rol de
//    administrador. En produccion eso no es aceptable, asi que se detiene el
//    arranque; es preferible no servir a servir con la sesion falsificable.
//
// El archivo va en la raiz del proyecto y no dentro de app/: en esta version de
// Next solo se reconoce ahi, y un archivo en app/ se ignora en silencio.
//
// La comprobacion del secreto y la del runtime viven aqui y no en
// app/lib/session-token.ts por dos razones: Next tambien importa ese modulo al
// construir, y ahi un throw reventaria durante `next build` en vez de al
// servir; y este archivo se compila tambien para Edge, donde la criptografia de
// Node no existe. Por eso se lee `process.env.AUTH_SECRET` directamente en vez de
// importar el modulo: es la misma condicion que aplica alli, sin arrastrar Node.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  assertSessionSecretConfigured();

  const { connectDataStore } = await import("@/lib/db");
  await connectDataStore();
}

function assertSessionSecretConfigured(): void {
  if (process.env.AUTH_SECRET) return;

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[auth] AUTH_SECRET no esta definida: se firmara con el secreto de desarrollo. " +
        "Define AUTH_SECRET en .env.local (ver .env.example)."
    );
    return;
  }

  throw new Error(
    "[auth] No hay un AUTH_SECRET propio y NODE_ENV es production. Con el secreto de " +
      "desarrollo, que esta en el repositorio, cualquiera puede firmar un token con rol " +
      "de administrador. Genera uno con `openssl rand -hex 32` y definalo en el entorno " +
      "de despliegue."
  );
}
