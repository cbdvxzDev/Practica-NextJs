import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center space-y-6">
      <p className="text-8xl font-black text-stone-200">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-stone-900">Página no encontrada</h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Lo sentimos, no pudimos encontrar la página que buscas.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-full bg-stone-900 px-8 text-sm font-semibold text-white hover:bg-stone-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}