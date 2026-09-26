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
      // Clave con la que Zustand persiste la sesión en localStorage.
      // Debe coincidir con `persist({ name })` de app/store/auth.store.ts.
      storageKey: 'auth-storage',
      // Duración real del token firmado en app/lib/auth.ts (24 h).
      sessionHours: 24,
    },
    site: {
      contactEmail: 'soporte@esencial.store',
      currency: 'COP',
    },
    images: {
      // Se usa cuando un producto todavía no tiene fotografía asociada.
      // El catálogo se sirve desde /public/images (ver scripts/catalog-images.mjs).
      placeholder: '/images/placeholder.svg',
    },
  } as const;