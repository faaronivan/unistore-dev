import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import UploadAppModal from '@/components/UploadAppModal';
import PaymentCheckoutModal from '@/components/PaymentCheckoutModal';

export const metadata: Metadata = {
  title: 'UniStore Dev — Tienda de Software Universitario',
  description: 'Explora, descarga y apoya el software de tus compañeros de Ingeniería en Sistemas.',
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <StoreProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <AuthModal />
          <UploadAppModal />
          <PaymentCheckoutModal />
        </StoreProvider>
      </body>
    </html>
  );
}