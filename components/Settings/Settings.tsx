import React, { useState } from "react";
import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";
import { Button } from "components/Button";
import { useRouter } from "next/router";
import { useTranslation } from "hooks/useTranslation";
import { setQueryParams } from "hooks/useQueryParams";

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
  const [inputValue, setInputValue] = useState(stationId || "");

  const { t } = useTranslation();

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If station id is the same as the current station id, don't do anything
    if (inputValue === stationId) {
      setIsEditMode(false);
      return;
    }

    await setQueryParams({
      router,
      params: { station: inputValue },
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
            {t("stationIdFrom")}{" "}
            <a
              href={`https://app.birdweather.com/${
                speciesError || !stationId ? "" : `/stations/${stationId}`
              }`}
              className="link"
              target="_blank"
              rel="noopener noreferrer"
            >
              BirdWeather ↗
            </a>
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              value={inputValue}
              handleChange={handleInputChange}
              width="small"
              type="number"
            />

            <Button type="submit">{t("save")}</Button>
          </form>
        </>
      )}
    </div>
  );
};
