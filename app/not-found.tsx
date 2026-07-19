// app/not-found.tsx
import Link from 'next/link';
import { ROUTES } from '../app/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Página no encontrada
      </h2>
      <p className="text-gray-600 mb-8 max-w-sm">
        Lo sentimos, no pudimos encontrar la página que buscas en nuestro sistema.
      </p>
      
      <Link 
        href={ROUTES.HOME}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}