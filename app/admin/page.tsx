import { redirect } from "next/navigation";

/**
 * `/admin` no es una pantalla: es la puerta de entrada al panel.
 * La protección de rol vive en `app/admin/layout.tsx`, que ya se ejecuta
 * para esta ruta y para todas sus hijas.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
