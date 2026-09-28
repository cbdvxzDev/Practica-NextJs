// layout.tsx
import type { Metadata } from "next";

/* El título va con `absolute` y no con el `template` del layout raíz porque
   estas rutas son Client Components (next no permite exportar `metadata` desde
   uno) y además se anidan dentro de otro layout que ya trae título. Con
   `absolute` el resultado es determinista y nunca sale duplicado. */
export const metadata: Metadata = {
  title: { absolute: "Esencial - Detalle del usuario" },
  description: "Datos e historial de un cliente.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
