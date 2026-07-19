// app/utils/formatDate.ts

/**
 * Formatea una fecha ISO o timestamp a un formato legible en español (Colombia).
 * Ejemplo: "27 de junio de 2026"
 */
export const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  };
  
  /**
   * Formato corto para tablas de administración.
   * Ejemplo: "27/06/2026"
   */
  export const formatDateShort = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  };