import { PageTitle } from "@/compents/common/PageTitle";
import { Button } from "@/compents/ui/Button";

// Estructura de datos mockeada para la gestión de usuarios (Alineado con data/users.json)
const MOCK_ADMIN_USERS = [
  {
    id: "usr-1",
    name: "Alejandro Pérez",
    email: "alejandro@example.com",
    role: "admin", // admin, customer
    joinedAt: "12 Mar, 2025",
    status: "active", // active, suspended
  },
  {
    id: "usr-2",
    name: "Carolina Gómez",
    email: "carolina@example.com",
    role: "admin",
    joinedAt: "15 Ene, 2026",
    status: "active",
  },
  {
    id: "usr-3",
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    role: "customer",
    joinedAt: "24 Jun, 2026",
    status: "active",
  },
  {
    id: "usr-4",
    name: "Sofía Restrepo",
    email: "sofia@example.com",
    role: "customer",
    joinedAt: "10 May, 2026",
    status: "suspended",
  },
];

// Obtener iniciales de manera limpia para el avatar conceptual
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default async function AdminUsersPage() {
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
            placeholder="Buscar por nombre o email..."
            className="w-full h-9 px-3 text-sm rounded-button border border-border focus:outline-none focus:border-brand-dark transition-colors bg-brand-light/50"
          />
        </div>
        <div className="text-xs text-brand-muted">
          Total de registros: <span className="font-medium text-brand-dark">{MOCK_ADMIN_USERS.length}</span>
        </div>
      </div>

      {/* TABLA DE USUARIOS MAESTRA */}
      <section className="bg-white border border-border/60 rounded-card shadow-subtle overflow-hidden">
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
              {MOCK_ADMIN_USERS.map((user) => (
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
                    {user.joinedAt}
                  </td>

                  {/* ESTADO DE ACCESO */}
                  <td className="py-4 px-6">
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${
                      user.status === "active" ? "text-neutral-900" : "text-brand-muted line-through"
                    }`}>
                      {user.status === "active" ? "● Activo" : "○ Suspendido"}
                    </span>
                  </td>

                  {/* ACCIONES DISCRETAS */}
                  <td className="py-4 px-6 text-right">
                    <Button variant="ghost" className="h-8 px-3 text-xs text-brand-dark hover:underline">
                      Gestionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}