"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (pathname !== "/admin/login" && (!user || user.role !== "admin")) {
      router.replace("/admin/login");
    }
  }, [pathname, router, user]);

  if (pathname !== "/admin/login" && (!user || user.role !== "admin")) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">Verificando acceso...</div>;
  }

  return children;
}
