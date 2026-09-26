import type { NextConfig } from "next";
import os from "os";

/**
 * Detecta todas las IPs locales (IPv4, no loopback) para que el dev server
 * acepte peticiones desde localhost y desde cualquier equipo de la red local
 * (celulares, tablets, portátiles accediendo por http://<IP-de-esta-PC>:3000).
 * De esta forma ambos http://localhost:3000 y http://192.168.x.y:3000 funcionan
 * sin importar cómo cambie la IP del WiFi.
 */
function getLocalIPv4Addresses(): string[] {
  const addresses: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return [...new Set(addresses)];
}

const nextConfig: NextConfig = {
  // En desarrollo, Next.js bloquea peticiones cross-origin a assets del dev server
  // (JS/CSS/websocket de HMR). Permitimos localhost + todas las IPs de la LAN.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "[::1]",
    ...getLocalIPv4Addresses(),
  ],
  images: {
    // El catálogo se sirve desde /public/images (ver scripts/catalog-images.mjs),
    // así que no necesita hosts remotos. Estos patrones quedan por si se
    // escriben URLs externas desde el panel de administración.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.stocksnap.io", pathname: "/img-thumbs/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;