"use client";

import * as React from "react";

export interface Category {
  id: string;
  label: string;
  count?: number;
}

// Simulamos la fuente de datos; esto se reemplazará por una llamada a tu API/Base de datos
const MOCK_CATEGORIES: Category[] = [
  { id: "new-arrivals", label: "Novedades" },
  { id: "accessories", label: "Accesorios" },
  { id: "clothing", label: "Ropa" },
  { id: "limited-edition", label: "Edición Limitada" },
];

export const useCategories = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("all");
  const [loading, setLoading] = React.useState<boolean>(true);

  // Efecto para "fetch" inicial de categorías
  React.useEffect(() => {
    // Aquí iría tu llamada real: fetch('/api/categories')
    const loadCategories = async () => {
      try {
        setLoading(true);
        // Simulando delay de red
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCategories(MOCK_CATEGORIES);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const selectCategory = (id: string) => {
    setSelectedCategoryId(id);
  };

  return {
    categories,
    selectedCategoryId,
    selectCategory,
    loading,
  };
};