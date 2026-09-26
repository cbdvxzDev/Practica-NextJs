"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Users as UsersIcon } from "lucide-react";
import { PageTitle } from "@/components/common/PageTitle";
import { Button } from "@/components/ui/Button";
import { UserService, type UserAdmin } from "@/services/user.service";
import { downloadCSV, todayStamp } from "@/lib/csv";

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = React.useState<UserAdmin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    UserService.getAll()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
        setLoading(false);
      });
  }, []);

  const exportCSV = () => {
    downloadCSV(
      `usuarios-${todayStamp()}`,
      ["Nombre", "Email", "Rol", "Creado", "Estado"],
      users.map((u) => [
        u.name,
        u.email,
        u.role,
        new Date(u.createdAt).toLocaleDateString("es-CO"),
        u.isActive ? "Activo" : "Inactivo",
      ])
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <PageTitle title="Usuarios" description="Administra las cuentas registradas en la plataforma." />
        <Button variant="secondary" className="h-9 text-xs" onClick={exportCSV} disabled={users.length === 0}>
          Exportar usuarios
        </Button>
      </div>

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-button px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-10 space-y-3 animate-pulse">
            <div className="h-3 bg-neutral-100 rounded w-40" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
            <div className="h-8 bg-neutral-100 rounded w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-neutral-50 flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-brand-muted/60" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-brand-dark">Aún no hay usuarios registrados</h3>
              <p className="text-xs text-brand-muted max-w-xs">
                Los usuarios aparecerán aquí a medida que se registren en la plataforma.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-brand-dark text-white flex items-center justify-center font-medium text-xs">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-brand-dark">{user.name}</span>
                    </td>
                    <td className="py-4 px-6 text-brand-muted">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        user.role === "admin" ? "bg-brand-dark text-white" : "bg-neutral-100 text-neutral-800"
                      }`}>
                        {user.role === "admin" ? "Administrador" : user.role === "support" ? "Soporte" : "Cliente"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-brand-muted text-xs">
                      {new Date(user.createdAt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-medium uppercase tracking-wider ${user.isActive ? "text-neutral-900" : "text-red-600"}`}>
                        {user.isActive ? "● Activo" : "○ Inactivo"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-xs font-medium text-brand-dark hover:underline underline-offset-4 transition-colors"
                      >
                        Ver detalle →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}