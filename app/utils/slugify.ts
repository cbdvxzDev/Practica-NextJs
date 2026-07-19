// app/utils/slugify.ts

/**
 * Convierte una cadena de texto en un "slug" (URL amigable).
 * Ejemplo: "Seguridad Electrónica" -> "seguridad-electronica"
 * * @param text - El texto a convertir
 * @returns El slug generado
 */
export const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Reemplaza espacios con guiones
      .replace(/[^\w\-]+/g, '')       // Elimina caracteres no alfanuméricos (incluyendo acentos)
      .replace(/\-\-+/g, '-');        // Reemplaza múltiples guiones por uno solo
  };