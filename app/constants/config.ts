// app/constants/config.ts

/**
 * Configuración global de la aplicación.
 * Centraliza variables de entorno y constantes de comportamiento.
 */
export const CONFIG = {
    appName: 'NOVA',
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
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
      contactEmail: 'soporte@nova.com',
      currency: 'COP',
    },
  } as const;