import React from "react";

import styles from "./StationView.module.scss";
import { Spinner } from "components/Spinner";
import { LastUpdated } from "components/LastUpdated";
import { BirdCardGrid } from "components/BirdCardGrid";
import { BirdCard } from "components/BirdCard";
import { Button } from "components/Button";
import { Settings } from "components/Settings";
import { Block } from "components/Block";
import { NewSpecies } from "components/NewSpecies";
import { Species } from "hooks/useFetchSpecies";
import { useTranslation } from "hooks/useTranslation";
import { getSortedSpeciesList } from "utils/species";
import { setQueryParams } from "hooks/useQueryParams";
import { useRouter } from "next/router";
import { Search } from "components/Search";

type Props = {
  speciesData: Species[];
  speciesError: Error | null;
  stationId: string;
  stationName?: string;
  sort: string;
  search: string;
  lang: string;
  isLoadingSpecies: boolean;
};

export const StationView: React.FC<Props> = ({
  speciesData,
  speciesError,
  stationId,
  stationName,
  sort,
  search,
  lang,
  isLoadingSpecies,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

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
        stationId={stationId}
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
