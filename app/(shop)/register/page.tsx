"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterForm, type RegisterFormData } from "../../compents/forms/RegisterForm";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (data: RegisterFormData) => {
    const user = await AuthService.register({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setAuth(user);
    router.push("/");
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="w-full max-w-md space-y-8 bg-white border border-border/60 rounded-card p-8 shadow-subtle">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-auto flex items-center justify-center font-semibold tracking-wider text-xl uppercase">
            Esencial
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-brand-dark">
            Crear una cuenta
          </h1>
          <p className="text-sm text-brand-muted">
            Regístrate para gestionar tus pedidos y guardar tus piezas favoritas.
          </p>
        </div>

        <RegisterForm onSubmit={handleSubmit} />

        <div className="text-center pt-2 border-t border-border/40">
          <p className="text-sm text-brand-muted">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-dark hover:underline underline-offset-4 transition-all">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}