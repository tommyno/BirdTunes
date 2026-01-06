import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

import { useFetchStation } from "hooks/useFetchStation";
import { useTranslation } from "hooks/useTranslation";
import { getQueryParam } from "hooks/useQueryParams";
import { getPageTitle } from "utils/species";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { StationView } from "components/StationView/StationView";

const DEFAULT_STATION_ID = "8588";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  const stationId = getQueryParam({
    value: router.query.station,
  });

  const { data: stationData } = useFetchStation(
    stationId || DEFAULT_STATION_ID
  );

  const title = getPageTitle(stationData?.name);

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

      <StationView stationName={stationData?.name} />

      <Footer />
    </>
  );
}

// Pass language to _document.tsx (to dynamically set html lang attribute)
export const getServerSideProps: GetServerSideProps<{ lang: string }> = async (
  context
) => {
  // Default to english
  const { lang = "en" } = context.query;
  return {
    props: {
      // Handle array case if multiple params are sent
      lang: Array.isArray(lang) ? lang[0] : lang,
    },
  };
};
