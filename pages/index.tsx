import { useFetchSpecies } from "hooks/useFetchSpecies";
import { useFetchStation } from "hooks/useFetchStation";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParams } from "hooks/useQueryParams";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getPageTitle } from "utils/species";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { StationView } from "components/StationView/StationView";

export default function Home() {
  const router = useRouter();
  const isReady = router.isReady;
  const { t } = useTranslation();

  // Get query parameters with defaults
  const [params] = useQueryParams({
    defaults: {
      station: "8588",
      lang: "en",
      period: "all",
      sort: "active",
      search: "",
    },
    ready: isReady,
  });

  const { station: stationId, lang, period, sort, search } = params;

  const {
    data: speciesData = [],
    isLoading: isLoadingSpecies,
    error: speciesError,
  } = useFetchSpecies({
    stationId,
    lang,
    period,
    enabled: isReady,
  });

  const { data: stationData } = useFetchStation(stationId);

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

      <StationView
        speciesData={speciesData}
        speciesError={speciesError}
        stationId={stationId}
        stationName={stationData?.name}
        sort={sort}
        search={search}
        lang={lang}
        isLoadingSpecies={isLoadingSpecies}
      />

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
