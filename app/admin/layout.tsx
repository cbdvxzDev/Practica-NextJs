import { SidebarAdmin } from "@/compents/admin/SidebarAdmin";
import { AdminGuard } from "@/compents/admin/AdminGuard";
import { AdminHeader } from "@/compents/admin/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
    <div className="flex min-h-screen w-full overflow-hidden bg-brand-light">
      {/* 1. BARRA LATERAL ADMINISTRATIVA (Ancho fijo en desktop, fija a la izquierda) */}
      <SidebarAdmin />

      {/* 2. CONTENEDOR DE CONTENIDO PRINCIPAL */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Encabezado interno opcional para el admin (usuario actual, notificaciones discretas) */}
        <AdminHeader />

        {/* Área de scroll para tablas e indicadores */}
        <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 sm:p-8 md:p-12 animate-fadeIn">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}