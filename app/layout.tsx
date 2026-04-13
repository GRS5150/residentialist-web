import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://theresidentialist.com'),
  title: {
    default: 'The Residentialist — Independent Product Intelligence',
    template: '%s | The Residentialist',
  },
  description:
    'Independent scores and ratings for residential building products. Evaluated on quality, durability, and performance.',
  openGraph: {
    siteName: 'The Residentialist',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans antialiased">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
