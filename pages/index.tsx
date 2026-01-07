import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import useSWR from "swr";
import { API_BASE_URL } from "constants/birdweather";
import { useTranslation } from "hooks/useTranslation";
import { getQueryParam } from "hooks/useQueryParams";
import { getPageTitle } from "utils/species";
import { fetcher } from "utils/fetcher";
import { Station } from "types/api";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { StationView } from "components/StationView/StationView";
import { PopularStations } from "components/PopularStations/PopularStations";
import { About } from "components/About/About";
import { Flow } from "components/Flow/Flow";
import { StationSearch } from "components/StationSearch";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  const stationId = getQueryParam({
    value: router.query.station,
  });

  const { data: stationData } = useSWR<Station>(
    stationId ? `${API_BASE_URL}/stations/${stationId}` : null,
    fetcher
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

      <div className="wrap">
        {/* Show when no station is selected */}
        {!stationId && (
          <div className="smallWrap">
            <Flow>
              <StationSearch />
              <PopularStations />
              <About />
            </Flow>
          </div>
        )}

        {/* Show when a station is selected */}
        {stationId && <StationView stationName={stationData?.name} />}
      </div>

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
