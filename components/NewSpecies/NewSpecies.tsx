import React from "react";
import styles from "./NewSpecies.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { useTranslation } from "hooks/useTranslation";
import { getItem, setItem } from "hooks/useLocalStorage";
type BirdnetStation = {
  id: string;
  species: string[];
  lastUpdated: number;
};

type Props = {
  speciesData: Species[];
  stationId: string | null;
};

export const NewSpecies: React.FC<Props> = ({ speciesData, stationId }) => {
  if (!stationId) return null;

  const { t } = useTranslation();

  // Get species ids from local storage
  const localstoreData = getItem("newSpecies") as BirdnetStation[];
  const speciesIdsFromLocalStorage = localstoreData.find(
    (station) => station.id === stationId
  )?.species;

  // Check if there is any new species (do this before updating local storage)
  const newSpecies = speciesData.filter(
    ({ id }) => !speciesIdsFromLocalStorage?.map(Number).includes(id)
  );

  // Update local storage if the station has not been updated in the last minute
  const isRecentlyUpdated =
    (localstoreData?.find((station) => station.id === stationId)?.lastUpdated ??
      0) >
    Date.now() - 60 * 1000;

  // Update local storage
  if (!isRecentlyUpdated) {
    const stationIndex = localstoreData.findIndex(
      (station) => station.id === stationId
    );
    const newStationData = {
      id: stationId,
      species: speciesData.map((species) => species.id),
      lastUpdated: Date.now(),
    };

    let updatedData;
    if (stationIndex >= 0) {
      // Update existing station
      updatedData = localstoreData.map((station, index) =>
        index === stationIndex ? newStationData : station
      );
    } else {
      // Add new station
      updatedData = [...localstoreData, newStationData];
    }

    setItem("newSpecies", JSON.stringify(updatedData));
  }

  // Decide if new species should be shown
  if (newSpecies.length === 0) return null;

  // If all species are new, don't show anything
  if (newSpecies.length === speciesData.length) return null;

  // If there is a ton of new species, don't show anything
  if (newSpecies.length > 20) return null;

  return (
    <div className={styles.wrap}>
      <p>
        {newSpecies.length} {t("newSpecies")} {t("sinceLastVisit")}:
      </p>
      <div className={styles.list}>
        {newSpecies.map((species) => (
          <span key={species.id}>{species.commonName}</span>
        ))}
      </div>
    </div>
  );
};
