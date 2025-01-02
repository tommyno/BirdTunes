import type { AppProps } from "next/app";
import Head from "next/head";
import { ModalProvider } from "contexts/ModalContext";

import "/styles/index.scss";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ModalProvider>
        <Component {...pageProps} />
      </ModalProvider>
    </>
  );
}
