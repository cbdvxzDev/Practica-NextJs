import Link from "next/link";
import { LoginForm } from "../../compents/forms/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-card border border-border/60 bg-white p-8 shadow-subtle">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">NOVA Business</p>
          <h1 className="text-2xl font-medium">Acceso administrativo</h1>
          <p className="text-sm text-brand-muted">Gestiona inventario, productos, pedidos y usuarios.</p>
        </div>
        <LoginForm adminOnly />
        <p className="text-center text-xs text-brand-muted">
          ¿Eres cliente? <Link href="/login" className="font-medium text-brand-dark underline">Volver a la tienda</Link>
        </p>
        <p className="text-center text-[11px] text-brand-muted">Demo: admin@nova.com · Admin123!</p>
      </div>
    </div>
  );
}
