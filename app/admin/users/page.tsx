"use client";

import * as React from "react";
import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";
import { AuthService, type AdminAuthUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

// Obtener iniciales de manera limpia para el avatar conceptual
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = React.useState<AdminAuthUser[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [managingId, setManagingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUsers(AuthService.getAdminUsers());
    setHydrated(true);
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const managingUser = users.find((user) => user.id === managingId) ?? null;

  const handleToggleSuspend = (id: string) => {
    const updated = AuthService.toggleSuspend(id);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  };

  const handleToggleRole = (id: string) => {
    const target = users.find((user) => user.id === id);
    if (!target) return;
    const nextRole = target.role === "admin" ? "customer" : "admin";
    const updated = AuthService.setRole(id, nextRole);
    setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
  };

  return (
    <div className="space-y-8">
      {/* CABECERA GENERAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle 
          title="Usuarios" 
          description="Administra las cuentas registradas en la plataforma, audita roles y gestiona accesos." 
        />
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="h-9 text-xs">
            Exportar usuarios
          </Button>
        </div>
      </div>

      {/* BARRA DE FILTRADO RÁPIDO */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-border/60 rounded-card p-4 shadow-subtle w-full">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full h-9 px-3 text-sm rounded-button border border-border focus:outline-none focus:border-brand-dark transition-colors bg-brand-light/50"
          />
        </div>
        <div className="text-xs text-brand-muted">
          Total de registros: <span className="font-medium text-brand-dark">{hydrated ? filteredUsers.length : 0}</span>
        </div>
      </div>

      {/* TABLA DE USUARIOS MAESTRA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {!hydrated || filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-sm text-brand-muted">
            {hydrated ? "No hay usuarios que coincidan con la búsqueda." : "Cargando…"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-border/40 text-brand-muted text-xs font-medium uppercase tracking-wider">
                  <th className="py-3 px-6">Usuario</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Rol</th>
                  <th className="py-3 px-6">Miembro Desde</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/40 transition-colors">
                    {/* IDENTIDAD / AVATAR */}
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-brand-dark text-white flex items-center justify-center font-medium text-xs tracking-wider">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-brand-dark">{user.name}</span>
                    </td>

                    {/* EMAIL */}
                    <td className="py-4 px-6 text-brand-muted">
                      {user.email}
                    </td>

                    {/* ROL */}
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        user.role === "admin" 
                          ? "bg-brand-dark text-white" 
                          : "bg-neutral-100 text-neutral-800"
                      }`}>
                        {user.role === "admin" ? "Administrador" : "Cliente"}
                      </span>
                    </td>

                    {/* FECHA DE REGISTRO */}
                    <td className="py-4 px-6 text-brand-muted text-xs">
                      {new Date(user.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    {/* ESTADO DE ACCESO */}
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-medium uppercase tracking-wider ${
                        !user.suspended ? "text-neutral-900" : "text-brand-muted line-through"
                      }`}>
                        {!user.suspended ? "● Activo" : "○ Suspendido"}
                      </span>
                    </td>

                    {/* ACCIONES DISCRETAS */}
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-brand-dark hover:underline"
                        onClick={() => setManagingId(user.id)}
                      >
                        Gestionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DE GESTIÓN DE CUENTA */}
      {managingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-card bg-white p-6 space-y-5 shadow-lg">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-brand-dark">Gestionar cuenta</h3>
              <p className="text-xs text-brand-muted">{managingUser.name} · {managingUser.email}</p>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full h-10 text-xs justify-center"
                disabled={managingUser.id === currentUser?.id}
                onClick={() => handleToggleRole(managingUser.id)}
              >
                {managingUser.role === "admin" ? "Quitar permisos de administrador" : "Promover a administrador"}
              </Button>
              <Button
                variant="secondary"
                className="w-full h-10 text-xs justify-center text-red-600 hover:bg-red-50"
                disabled={managingUser.id === currentUser?.id}
                onClick={() => handleToggleSuspend(managingUser.id)}
              >
                {managingUser.suspended ? "Reactivar cuenta" : "Suspender cuenta"}
              </Button>
              {managingUser.id === currentUser?.id && (
                <p className="text-[11px] text-brand-muted text-center">No puedes modificar tu propia cuenta desde aquí.</p>
              )}
            </div>

            <Button variant="ghost" className="w-full h-9 text-xs" onClick={() => setManagingId(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}