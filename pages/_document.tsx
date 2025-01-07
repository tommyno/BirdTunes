import { Html, Head, Main, NextScript } from "next/document";

export default function Document(props: any) {
  // Get lang from query params
  // Use English as default, unless Norwegian is selected
  // .. these are currently the only two UI languages supported
  const lang = props?.__NEXT_DATA__?.query?.lang === "no" ? "no" : "en";

  return (
    <Html lang={lang}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
