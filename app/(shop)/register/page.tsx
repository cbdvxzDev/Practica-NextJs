import Link from "next/link";
import { RegisterForm } from "../../compents/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Contenedor principal con proporciones idénticas a las de login */}
      <div className="w-full max-w-md space-y-8 bg-white border border-border/60 rounded-card p-8 shadow-subtle">
        
        {/* Encabezado e Identidad de la pantalla */}
        <div className="text-center space-y-2">
          {/* Espacio reservado para tu logo minimalista */}
          <div className="mx-auto h-8 w-auto flex items-center justify-center font-semibold tracking-wider text-xl uppercase">
            Plataforma
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-brand-dark">
            Crear una cuenta
          </h1>
          <p className="text-sm text-brand-muted">
            Regístrate para gestionar tus pedidos y guardar tus piezas favoritas.
          </p>
        </div>

        {/* Componente de Formulario Cliente Reutilizable de tu estructura */}
        <RegisterForm />

        {/* Enlace alternativo de Retorno al Login */}
        <div className="text-center pt-2 border-t border-border/40">
          <p className="text-sm text-brand-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              href="/login" 
              className="font-medium text-brand-dark hover:underline underline-offset-4 transition-all"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}