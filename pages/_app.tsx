import type { AppProps } from "next/app";
import Head from "next/head";
import { ModalProvider } from "contexts/ModalContext";
import Script from "next/script";

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

      <Script
        src="https://cloud.umami.is/script.js"
        data-website-id="fb88d8e1-5cd5-4760-b4ea-378c12c6301c"
        strategy="lazyOnload"
      />
    </>
  );
}
