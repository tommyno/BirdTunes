import Head from "next/head";
import dynamic from "next/dynamic";

import { useTranslation } from "hooks/useTranslation";
import { Header } from "components/Header";

// MapLibre needs the browser, so skip server-side rendering
const StationMap = dynamic(
  () => import("components/StationMap").then((mod) => mod.StationMap),
  { ssr: false }
);

export default function Map() {
  const { t } = useTranslation();
  const title = `${t("mapTitle")} | BirdTunes`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("pageDescription")} />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={t("pageDescription")} />
        <meta property="og:image" content="/open-graph-share.png" />
      </Head>

      <Header />

      <StationMap />
    </>
  );
}

export { getLangServerSideProps as getServerSideProps } from "utils/lang";
