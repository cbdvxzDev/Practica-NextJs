import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Los guards de hidratación (`setIsMounted` en un effect) son el patrón
      // recomendado por las stores persistidas de Zustand + Next.js para evitar
      // hydration mismatch. La regla del React Compiler la flaggea de forma
      // estricta; la bajamos a warning para conservar el lint útil sin bloquear
      // el patrón idiomático de hidratación.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
