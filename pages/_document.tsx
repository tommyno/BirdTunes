import { Locale } from "constants/translations";
import { Html, Head, Main, NextScript } from "next/document";

type Props = {
  __NEXT_DATA__: {
    query: {
      lang: string;
    };
  };
};

export default function Document(props: Props) {
  // Get lang from query params (with fallback to English)
  const queryLang = props?.__NEXT_DATA__?.query?.lang;
  const lang: Locale = queryLang ? (queryLang as Locale) : "en";

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
