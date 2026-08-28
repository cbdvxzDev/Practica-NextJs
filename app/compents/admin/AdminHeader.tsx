"use client";

import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function AdminHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    clearAuth();
    AuthService.logout();
    router.replace("/login");
  };

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-white px-3 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-muted sm:text-xs">Área de gestión</p>
        <p className="hidden truncate text-xs text-brand-muted sm:block">{user?.name ?? "Administrador"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-brand-dark sm:gap-5">
        <span className="hidden items-center gap-2 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" />Sesión activa</span>
        <button type="button" onClick={handleLogout} className="rounded-button border border-border px-3 py-2 text-xs transition-colors hover:bg-brand-light">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
