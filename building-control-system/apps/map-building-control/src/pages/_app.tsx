// 'use client';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import '../styles/global.scss';
import AppLayout from '../components/Layout/Layout';
import { Provider } from 'react-redux';
import { store } from 'libs/global-state/src/lib/store';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <Provider store={store}>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </Provider>
    </div>
  );
}