// app/types/product.ts

export type ProductStatus = 'active' | 'out_of_stock' | 'discontinued';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  features: string[]; // Lista de características técnicas
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload para la creación de un nuevo producto en el dashboard administrativo.
 */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Payload para actualización parcial (patch) del inventario o precio.
 */
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;