import React from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { API_BASE_URL } from "constants/birdweather";
import { Spinner } from "components/Spinner";
import { LastUpdated } from "components/LastUpdated";
import { BirdCardGrid } from "components/BirdCardGrid";
import { BirdCard } from "components/BirdCard";
import { Button } from "components/Button";
import { StationTitle } from "components/StationTitle";
import { Block } from "components/Block";
import { NewSpecies } from "components/NewSpecies";
import { Search } from "components/Search";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParams, setQueryParams } from "hooks/useQueryParams";
import { setItem } from "hooks/useLocalStorage";
import { useLocalStorageCache } from "hooks/useLocalStorageCache";
import { getSortedSpeciesList } from "utils/species";
import { Species } from "types/api";
import { fetchAllSpeciesPages } from "utils/fetcher";
import styles from "./StationView.module.scss";
import { LoadingDots } from "components/LoadingDots";

type Props = {
  stationName?: string;
};

export const StationView: React.FC<Props> = ({ stationName }) => {
  const router = useRouter();
  const isReady = router.isReady;
  const { t } = useTranslation();

  // Get query parameters with defaults
  const [params] = useQueryParams({
    defaults: {
      lang: "en",
      period: "all",
      sort: "active",
      search: "",
    },
    ready: isReady,
  });

  const { station: stationId, lang, period, sort, search } = params;

  const shouldFetch = isReady && stationId && lang && period;
  const speciesUrl = shouldFetch
    ? `${API_BASE_URL}/stations/${stationId}/species?locale=${lang}&period=${period}`
    : null;

  // Cache key for localStorage (per station + period)
  const cacheKey = `birdtunes-species-${stationId}-${period}`;
  const cachedData = useLocalStorageCache<Species>(cacheKey);

  const {
    data: speciesData,
    isLoading: isLoadingSpecies,
    error: speciesError,
  } = useSWR<Species[]>(speciesUrl, fetchAllSpeciesPages, {
    onSuccess: (data) => setItem(cacheKey, JSON.stringify(data)),
  });

  // Use fresh data if available, otherwise show cached
  const displayData = speciesData ?? cachedData;

  const speciesList = getSortedSpeciesList({
    species: displayData,
    sort,
    search,
  });

  const handleSortBy = async (sortBy: string) => {
    const newParams: Record<string, string | null> = { sort: sortBy };

    // Remove search param when no longer in search view
    if (sortBy !== "search") {
      newParams.search = null;
    }

    await setQueryParams({ router, params: newParams });
  };

  return (
    <>
      <StationTitle
        speciesData={displayData}
        speciesError={speciesError}
        stationId={stationId}
        stationName={stationName}
        isLoadingSpecies={isLoadingSpecies}
      />

      <NewSpecies speciesData={displayData} stationId={stationId} />

      <Block top="4" bottom="5" center>
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
      </Block>

      {sort === "search" && <Search />}

      {isLoadingSpecies && (
        <Block center bottom="4">
          {cachedData.length > 0 ? (
            <p className="color-gray">
              {t("updating")}
              <LoadingDots />
            </p>
          ) : (
            <Spinner />
          )}
        </Block>
      )}

      <div style={{ position: "relative" }}>
        <BirdCardGrid>
          {speciesList.map((species) => (
            <BirdCard key={species.id} data={{ ...species, stationId, lang }} />
          ))}
        </BirdCardGrid>

        {speciesError && <p className="color-red">{speciesError.toString()}</p>}

        <LastUpdated lang={lang} />
      </div>
    </>
  );
};
