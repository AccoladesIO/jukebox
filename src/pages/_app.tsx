import { SessionProvider } from "next-auth/react";
import { AppProps } from 'next/app';
import { Session } from 'next-auth'; 
import '../styles/globals.css';
import { ContextProvider } from '@/context/Context';

interface CustomAppProps extends AppProps {
  pageProps: {
    session: Session | null; 
  };
}

export default function App({ Component, pageProps: { session, ...pageProps } }: CustomAppProps) {
  return (
    <ContextProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </ContextProvider>
  );
}
