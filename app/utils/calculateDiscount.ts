// app/utils/calculateDiscount.ts

/**
 * Calcula el precio final de un producto aplicando un descuento.
 * 
 * @param price - Precio original del producto
 * @param discountPercentage - Porcentaje de descuento (0 a 100)
 * @returns El precio final calculado
 */
export const calculateDiscount = (price: number, discountPercentage: number): number => {
    if (discountPercentage <= 0) return price;
    if (discountPercentage >= 100) return 0;
  
    const discountAmount = (price * discountPercentage) / 100;
    return Number((price - discountAmount).toFixed(2));
  };
  
  /**
   * Verifica si un producto tiene un descuento aplicado.
   */
  export const hasDiscount = (price: number, discountPrice?: number): boolean => {
    return !!discountPrice && discountPrice < price;
  };