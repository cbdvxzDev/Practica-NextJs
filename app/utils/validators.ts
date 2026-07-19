// app/utils/validators.ts

/**
 * Valida si una cadena es un SKU válido.
 * Formato esperado: Alfanumérico con guiones (ej: PROD-123-ABC)
 */
export const isValidSKU = (sku: string): boolean => {
    const skuRegex = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;
    return skuRegex.test(sku);
  };
  
  /**
   * Valida si un string es un formato de moneda válido (ej: 1250000.00)
   */
  export const isPriceFormat = (value: string): boolean => {
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    return priceRegex.test(value);
  };
  
  /**
   * Valida si una contraseña cumple con requisitos de seguridad básicos
   */
  export const isStrongPassword = (password: string): boolean => {
    // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongRegex.test(password);
  };