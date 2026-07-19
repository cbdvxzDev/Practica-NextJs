"use client";

import * as React from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>("light");

  // Efecto para inicializar el tema desde localStorage o sistema
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Función para aplicar clases al documento y persistir
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    localStorage.setItem("app-theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}