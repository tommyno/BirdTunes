import React, { useState } from "react";
import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";
import { Button } from "components/Button";
import { useRouter } from "next/router";
import { useTranslation } from "hooks/useTranslation";
import { setQueryParams } from "hooks/useQueryParams";
import { useStationSearch, SearchStation } from "hooks/useStationSearch";
import { Spinner } from "components/Spinner";

type Props = {
  speciesData?: Species[];
  speciesError?: Error | null;
  stationId?: string | null;
  stationName?: string | null;
};

export const Settings: React.FC<Props> = ({
  speciesData,
  speciesError,
  stationId,
  stationName,
}) => {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { t } = useTranslation();

  // Search for stations when user types
  const { data: searchResults, isLoading } = useStationSearch(inputValue);

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowResults(value.length > 0);
  };

  const handleSelectStation = async (station: SearchStation) => {
    // If station id is the same as the current station id, don't do anything
    if (station.id === stationId) {
      setIsEditMode(false);
      return;
    }

    await setQueryParams({
      router,
      params: { station: station.id },
      options: { shallow: false },
    });
    setIsEditMode(false);

    // Hack: refresh page to load new data
    window.location.reload();
  };

  // Remove "BirdNET-Pi - " from stationName
  const cleanStationName = stationName?.replace("BirdNET-Pi - ", "");

  return (
    <div className={styles.wrap}>
      {!isEditMode && (
        <>
          <h2 className={styles.title}>
            <button
              className={styles.stationWrap}
              onClick={() => setIsEditMode(true)}
              title={t("changeStation")}
            >
              <span>{cleanStationName || t("changeStation")}</span>
              <img src="/icons/settings.svg" alt={t("changeStation")} />
            </button>
          </h2>

          <p>
            {speciesData?.length || 0} {t("species")} · {totalDetections}{" "}
            {t("detections")}
          </p>

          {speciesError && (
            <p className="color-red">{speciesError.toString()}</p>
          )}
        </>
      )}
      {isEditMode && (
        <>
          <p>
            <a
              href={`https://app.birdweather.com${
                speciesError || !stationId ? "" : `/stations/${stationId}`
              }`}
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              BirdWeather ↗
            </a>
          </p>

          <div className={styles.form}>
            <Input
              value={inputValue}
              handleChange={handleInputChange}
              type="text"
              placeholder={t("searchStation")}
            />

            <Button onClick={() => setIsEditMode(false)}>{t("close")}</Button>
          </div>

          {showResults && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  className={styles.stationResult}
                  onClick={() => handleSelectStation(station)}
                >
                  {station.name}{" "}
                  <small className="color-muted">#{station.id}</small>
                </button>
              ))}
            </div>
          )}

          {showResults && searchResults.length === 0 && isLoading && (
            <Spinner />
          )}

          {showResults && searchResults.length === 0 && !isLoading && (
            <p>{t("noResults")}</p>
          )}
        </>
      )}
    </div>
  );
};
