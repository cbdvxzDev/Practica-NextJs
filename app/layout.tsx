// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-commerce | Mercado Electrónico',
  description: 'Plataforma líder en gestión y venta de equipos de seguridad electrónica.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <main className="min-h-screen flex flex-col">
          {/* Aquí irán posteriormente: <Navbar /> */}
          
          <div className="grow">
            {children}
          </div>

          {/* Aquí irán posteriormente: <Footer /> */}
        </main>
      </body>
    </html>
  );
}