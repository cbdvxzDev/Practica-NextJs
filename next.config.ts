import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En desarrollo, Next.js bloquea peticiones cross-origin a assets del dev server.
  // Agrega aquí el IP/localhost desde donde accedas (móvil, otra PC en tu red local).
  // La IP cambia según tu WiFi: verifícala con `ipconfig` o `Get-NetIPAddress`.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "[::1]",
    "192.168.1.12",
    "192.168.1.13",
  ],
};

export default nextConfig;