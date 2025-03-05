import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/global.scss';
import AppLayout from '../components/Layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Map Building Control',
  description: 'Kurumsal Harita ve Yapı Kontrol Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}