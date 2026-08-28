import Link from "next/link";
import { LoginForm } from "../../compents/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Contenedor principal del formulario con proporciones estrictas */}
      <div className="w-full max-w-md space-y-8 bg-white border border-border/60 rounded-card p-8 shadow-subtle">
        
        {/* Encabezado e Identidad Visual de la pantalla */}
        <div className="text-center space-y-2">
          {/* Espacio reservado para tu logo minimalista */}
           <div className="mx-auto flex h-8 w-auto items-center justify-center text-xl font-semibold uppercase tracking-wider">
            NOVA
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-brand-dark">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-brand-muted">
            Ingresa tus credenciales. Te llevaremos automáticamente a tu espacio de cliente o administración.
          </p>
        </div>
        <p className="text-center text-[11px] text-brand-muted">Cliente: cliente@nova.com · Admin: admin@nova.com</p>

        {/* Componente de Formulario Cliente Reutilizable */}
        <LoginForm />

        {/* Enlace alternativo de Registro */}
        <div className="text-center pt-2 border-t border-border/40">
          <p className="text-sm text-brand-muted">
            ¿No tienes una cuenta?{" "}
            <Link 
              href="/register" 
              className="font-medium text-brand-dark hover:underline underline-offset-4 transition-all"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}