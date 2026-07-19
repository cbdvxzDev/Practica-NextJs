// app/constants/colors.ts

/**
 * Paleta de colores centralizada para GiborSec.
 * Basada en una identidad de seguridad electrónica (profesional y confiable).
 */
export const COLORS = {
    primary: {
      DEFAULT: '#0056b3', // Azul profesional/seguridad
      dark: '#004494',
      light: '#e6f0ff',
    },
    secondary: {
      DEFAULT: '#6c757d', // Gris neutro/tecnológico
      dark: '#495057',
      light: '#f8f9fa',
    },
    status: {
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545', // Para alertas críticas de seguridad
      info: '#17a2b8',
    },
    neutral: {
      white: '#ffffff',
      black: '#212529',
      gray: '#adb5bd',
    },
  } as const;
  
  // Tipo exportado para asegurar consistencia en componentes
  export type AppColor = typeof COLORS;