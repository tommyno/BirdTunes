import React from "react";
import { useRouter } from "next/router";

import { Spinner } from "components/Spinner";
import { LastUpdated } from "components/LastUpdated";
import { BirdCardGrid } from "components/BirdCardGrid";
import { BirdCard } from "components/BirdCard";
import { Button } from "components/Button";
import { Settings } from "components/Settings";
import { Block } from "components/Block";
import { NewSpecies } from "components/NewSpecies";
import { Search } from "components/Search";
import { useFetchSpecies } from "hooks/useFetchSpecies";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParams, setQueryParams } from "hooks/useQueryParams";
import { getSortedSpeciesList } from "utils/species";
import styles from "./StationView.module.scss";

type Props = {
  stationName?: string;
};

const DEFAULT_STATION_ID = "8588";

export const StationView: React.FC<Props> = ({ stationName }) => {
  const router = useRouter();
  const isReady = router.isReady;
  const { t } = useTranslation();

  // Get query parameters with defaults
  const [params] = useQueryParams({
    defaults: {
      station: DEFAULT_STATION_ID,
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

  const speciesList = getSortedSpeciesList({
    species: speciesData,
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
    <div className="wrap">
      <Settings
        speciesData={speciesData}
        speciesError={speciesError}
        stationId={stationId || DEFAULT_STATION_ID}
        stationName={stationName}
      />

      <NewSpecies speciesData={speciesData} stationId={stationId} />

      <Block top="4" bottom="5">
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

      <div style={{ position: "relative" }}>
        <BirdCardGrid>
          {speciesList.map((species) => (
            <BirdCard key={species.id} data={{ ...species, stationId, lang }} />
          ))}
        </BirdCardGrid>

        {speciesError && <p className="color-red">{speciesError.toString()}</p>}

        {isLoadingSpecies && <Spinner />}

        <LastUpdated lang={lang} />
      </div>
    </div>
  );
};
