// app/loading.tsx

export default function Loading() {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner animado usando Tailwind */}
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          
          <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
            Cargando...
          </h2>
          <p className="text-gray-500">Estamos preparando tu información</p>
        </div>
      </div>
    );
  }