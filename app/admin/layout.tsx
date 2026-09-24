"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../compents/layout/Sidebar";
import { Breadcrumbs } from "../compents/admin/Breadcrumbs";
import { AdminDataProvider } from "../compents/providers/AdminDataProvider";
import { useAuthStore } from "../store/auth.store";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <AdminDataProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-brand-light">
        <Sidebar />

        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between h-16 px-6 border-b border-border/30">
                <span className="text-sm font-semibold uppercase tracking-wider text-brand-dark">Esencial</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-brand-muted hover:text-brand-dark" aria-label="Cerrar menú">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div onClick={() => setIsSidebarOpen(false)}>
                <Sidebar className="!static !flex !w-full !border-0" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
          <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-brand-dark lg:hidden flex-shrink-0" aria-label="Abrir menú">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Breadcrumbs />
            </div>

            <div className="flex items-center space-x-4 text-sm font-medium text-brand-dark flex-shrink-0">
              <span className="hidden sm:inline">{user?.name ?? "Admin Mode"}</span>
              <button onClick={handleLogout} className="text-xs font-medium text-brand-muted hover:text-red-600 transition-colors underline underline-offset-4">
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-neutral-50/50 p-8 md:p-12 animate-fadeIn">
            <div className="max-w-6xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </AdminDataProvider>
  );
}