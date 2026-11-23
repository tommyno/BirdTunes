import Head from "next/head";
import { useRouter } from "next/router";
import { API_BASE_URL } from "constants/birdweather";
import { useTranslation } from "hooks/useTranslation";
import { getQueryParam } from "hooks/useQueryParams";
import { getPageTitle } from "utils/species";
import { fetcher } from "utils/fetcher";
import { useCachedSWR } from "hooks/useCachedSWR";
import { Station } from "types/api";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { StationView } from "components/StationView";
import { PopularStations } from "components/PopularStations";
import { About } from "components/About";
import { Flow } from "components/Flow";
import { StationSearch } from "components/StationSearch";
import { Favourites } from "components/Favourites";

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();

  const stationId = getQueryParam({
    value: router.query.station,
  });

  const { data: displayStation } = useCachedSWR<Station>({
    cacheKey: `birdtunes-station-${stationId}`,
    url: stationId ? `${API_BASE_URL}/stations/${stationId}` : null,
    fetcher,
  });

  const title = getPageTitle(displayStation?.name);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("pageDescription")} />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={t("pageDescription")} />
        <meta property="og:image" content="/open-graph-share.png" />
      </Head>

      <Header showArrow={!!stationId} />

      <div className="wrap">
        {/* Show when no station is selected */}
        {!stationId && (
          <div className="smallWrap">
            <Flow space="xlarge" fixed>
              <StationSearch />
              <Favourites />
              <PopularStations />
              <About />
            </Flow>
          </div>
        )}

        {/* Show when a station is selected */}
        {stationId && <StationView stationName={displayStation?.name} />}
      </div>

      <Footer />
    </>
  );
}

export { getLangServerSideProps as getServerSideProps } from "utils/lang";
