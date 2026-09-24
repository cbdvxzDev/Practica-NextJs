// app/constants/config.ts

/**
 * Configuración global de la aplicación.
 * Centraliza variables de entorno y constantes de comportamiento.
 */
export const CONFIG = {
    appName: 'Esencial',
    api: {
      // Apunta por defecto al mini-backend local (misma origin).
      // Para apuntar a otro servidor, usa la variable de entorno NEXT_PUBLIC_API_URL.
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 10000, // 10 segundos
    },
    pagination: {
      defaultLimit: 12,
    },
    auth: {
      tokenKey: 'auth_token',
      sessionExpiryMinutes: 60,
    },
    site: {
      contactEmail: 'soporte@esencial.store',
      currency: 'COP',
    },
  } as const;