"use client";

import * as React from "react";
import { useDebounce } from "./useDebounce";
import { usePagination } from "./usePagination";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "activo" | "agotado";
}

export const useProducts = (initialProducts: Product[] = []) => {
  const [products] = React.useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  
  // Optimizamos el término de búsqueda con debounce
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Lógica de filtrado
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, selectedCategory]);

  // Integración de paginación
  const pagination = usePagination({
    totalItems: filteredProducts.length,
    itemsPerPage: 10,
  });

  // Productos paginados para mostrar en pantalla
  const displayProducts = filteredProducts.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  return {
    displayProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    pagination,
    totalResults: filteredProducts.length,
  };
};