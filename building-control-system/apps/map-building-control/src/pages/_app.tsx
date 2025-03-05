import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import '../styles/global.scss';
import AppLayout from '../components/Layout/Layout';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </div>
  );
}