import { BirdCard } from "components/BirdCard";
import { BirdCardGrid } from "components/BirdCardGrid";
import { Button } from "components/Button";
import { LastUpdated } from "components/LastUpdated";
import { Search } from "components/Search";
import { Settings } from "components/Settings";
import { Spinner } from "components/Spinner";
import { STATION_ID } from "constants/birdweather";
import { useFetchSpecies } from "hooks/useFetchSpecies";
import { useFetchStation } from "hooks/useFetchStation";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParams } from "hooks/useQueryParams";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { LanguageSwitcher } from "components/LanguageSwitcher";
import { GetServerSideProps } from "next";
import { NewSpecies } from "components/NewSpecies/NewSpecies";

export default function Home() {
  const router = useRouter();
  const isReady = router.isReady;
  const { t } = useTranslation();

  // Get query parameters with defaults
  const [params, { setParams }] = useQueryParams({
    defaults: {
      station: STATION_ID,
      lang: "en",
      period: "all",
      sort: "active",
      search: "",
    },
    ready: isReady,
  });

  const { station: stationId, lang, period, sort, search } = params;
  const searchFilter = search.toLowerCase();

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

  const speciesActive = [...speciesData].sort(
    (a, b) =>
      new Date(b.latestDetectionAt).getTime() -
      new Date(a.latestDetectionAt).getTime()
  );
  const speciesObservations = [...speciesData].sort(
    (a, b) => b.detections.total - a.detections.total
  );

  // Toggle different views/sortings
  const handleSortBy = async (sortBy: string) => {
    const params: Record<string, string | null> = { sort: sortBy };

    // Remove search param when no longer in search view
    if (sortBy !== "search") {
      params.search = null;
    }

    await setParams(params);
  };

  const filteredSpecies = useMemo(() => {
    const speciesList =
      sort === "observations" ? speciesObservations : speciesActive;
    if (!searchFilter) return speciesList;

    return speciesList?.filter(
      (species) =>
        species.commonName.toLowerCase().includes(searchFilter) ||
        species.scientificName.toLowerCase().includes(searchFilter)
    );
  }, [sort, speciesObservations, speciesActive, searchFilter]);

  const cleanStationName = stationData?.name?.replace("BirdNET-Pi - ", "");
  const title = cleanStationName
    ? `${cleanStationName} | BirdTunes`
    : "BirdTunes";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={t("pageDescription")} />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={t("pageDescription")} />
        <meta property="og:image" content="/open-graph-share.png" />
      </Head>

      <div className="header">
        <h1 className="h3">BirdTunes</h1>
        <LanguageSwitcher />
      </div>

      <div className="wrap">
        {!isLoadingSpecies && (
          <Settings
            speciesData={speciesData}
            speciesError={speciesError}
            stationId={stationId}
            stationName={stationData?.name}
          />
        )}

        {!isLoadingSpecies && (
          <NewSpecies speciesData={speciesData} stationId={stationId} />
        )}

        <div style={{ margin: "16px 0 24px" }}>
          <Button
            onClick={() => handleSortBy("active")}
            isActive={sort === "active" || sort === null}
          >
            {t("lastHeard")}
          </Button>
          <Button
            onClick={() => handleSortBy("observations")}
            isActive={sort === "observations"}
          >
            {t("mostVisits")}
          </Button>
          <Button
            onClick={() => handleSortBy("search")}
            isActive={sort === "search"}
          >
            {t("search")}
          </Button>
        </div>

        {sort === "search" && <Search />}

        {!isLoadingSpecies && (
          <div style={{ position: "relative" }}>
            <BirdCardGrid>
              {filteredSpecies?.map((species) => (
                <BirdCard
                  key={species.id}
                  data={{ ...species, stationId, lang }}
                />
              ))}
            </BirdCardGrid>

            {speciesError && (
              <p className="color-red">{speciesError.toString()}</p>
            )}

            <LastUpdated lang={lang} />
          </div>
        )}

        {isLoadingSpecies && <Spinner />}
      </div>

      {!isLoadingSpecies && (
        <div className="footer">
          <p>BirdTunes</p>
          <a
            href="https://github.com/tommyno/birdtunes"
            className="link"
            target="_blank"
          >
            Github ↗
          </a>
        </div>
      )}
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
