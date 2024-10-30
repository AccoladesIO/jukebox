import { SessionProvider } from "next-auth/react";
import { AppProps } from 'next/app';
import '../styles/globals.css';
import { ContextProvider } from '@/context/Context'


export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps & { pageProps: { session: any } }) {
  return (
    <ContextProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ContextProvider>
  );
}
