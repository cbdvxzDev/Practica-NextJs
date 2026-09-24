// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Esencial | Tienda de moda minimalista',
    template: '%s | Esencial',
  },
  description:
    'Ropa atemporal y diseño consciente. Prendas esenciales, envíos a toda Colombia y una experiencia de compra cuidada en cada detalle.',
  keywords: ['moda', 'ropa minimalista', 'e-commerce', 'tienda online', 'Esencial'],
  authors: [{ name: 'Esencial' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Esencial',
    title: 'Esencial | Tienda de moda minimalista',
    description:
      'Diseño atemporal, minimalismo funcional y piezas confeccionadas de forma consciente y responsable.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <div className="grow">{children}</div>
        </div>
      </body>
    </html>
  );
}