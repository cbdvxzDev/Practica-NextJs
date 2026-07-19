// app/utils/formatCurrency.ts

/**
 * Formatea un número como moneda local (COP).
 * * @param amount - El valor numérico a formatear
 * @returns Cadena de texto formateada (ej: "$ 1.250.000,00")
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Formato simplificado sin decimales para precios redondos
   */
  export const formatCurrencyCompact = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };