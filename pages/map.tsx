import Head from "next/head";
import dynamic from "next/dynamic";

import { STATIONS_URL } from "constants/stations";
import { useTranslation } from "hooks/useTranslation";
import { getPageTitle } from "utils/species";
import { Header } from "components/Header";

// MapLibre needs the browser, so skip server-side rendering
const StationMap = dynamic(
  () => import("components/StationMap").then((mod) => mod.StationMap),
  { ssr: false }
);

export default function Map() {
  const { t } = useTranslation();
  const title = getPageTitle(t("mapTitle"));

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("pageDescription")} />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={t("pageDescription")} />
        <meta property="og:image" content="/open-graph-share.png" />
        {/* Open the tile server connection while the map chunk downloads */}
        <link
          rel="preconnect"
          href="https://tiles.openfreemap.org"
          crossOrigin="anonymous"
        />
        {/* Start downloading the station list alongside the map chunk,
            instead of after it */}
        <link
          rel="preload"
          href={STATIONS_URL}
          as="fetch"
          crossOrigin="anonymous"
        />
      </Head>

      <Header />

      <StationMap />
    </>
  );
}

export { getLangServerSideProps as getServerSideProps } from "utils/lang";
