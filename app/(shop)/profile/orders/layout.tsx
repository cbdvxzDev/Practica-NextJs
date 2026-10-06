// layout.tsx
import type { Metadata } from "next";

/* El título va con `absolute` y no con el `template` del layout raíz porque
   esta ruta es Client Component (next no permite exportar `metadata` desde
   uno) y además se anida dentro de otro layout que ya trae título. Con
   `absolute` el resultado es determinista y nunca sale duplicado. */
export const metadata: Metadata = {
  title: { absolute: "Esencial - Mis pedidos" },
  description: "Listado de todos tus pedidos en Esencial.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
