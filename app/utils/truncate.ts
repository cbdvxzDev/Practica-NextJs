// app/utils/truncate.ts

/**
 * Trunca un texto a un número específico de caracteres y añade puntos suspensivos.
 * * @param text - El texto original
 * @param length - Longitud máxima permitida
 * @returns El texto truncado
 */
export const truncate = (text: string, length: number): string => {
    if (text.length <= length) return text;
    
    return text.substring(0, length).trim() + '...';
  };