// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CONFIG } from '@/constants/config';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

const TAGLINE = 'Ropa atemporal, día a día';
const DESCRIPTION =
  'Ropa atemporal y diseño consciente. Prendas esenciales, envíos a toda Colombia y una experiencia de compra cuidada en cada detalle.';

export const metadata: Metadata = {
  // Sin esto, Next no puede resolver las URLs absolutas de Open Graph y avisa
  // en el build. Apunta al dominio público de la tienda.
  metadataBase: new URL(CONFIG.site.url),
  title: {
    // La marca va delante: "Esencial - Vestidos", no "Vestidos | Esencial".
    default: `Esencial - ${TAGLINE}`,
    template: `Esencial - %s`,
  },
  description: DESCRIPTION,
  applicationName: 'Esencial',
  keywords: [
    'moda',
    'ropa minimalista',
    'e-commerce',
    'tienda online',
    'vestidos',
    'denim',
    'Esencial',
  ],
  authors: [{ name: 'Esencial' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Esencial',
    title: `Esencial - ${TAGLINE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Esencial - ${TAGLINE}`,
    description: DESCRIPTION,
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