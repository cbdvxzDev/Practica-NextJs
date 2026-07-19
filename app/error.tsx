'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../app/constants/routes';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Aquí podrías enviar el error a un servicio de monitoreo como Sentry
    console.error('GiborSec Error Boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        ¡Algo ha salido mal en E-commerce Esencial!
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Lo sentimos, hemos encontrado un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}