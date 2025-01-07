import React, { useState } from "react";
import styles from "./Settings.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { Input } from "components/Input/Input";
import { Button } from "components/Button";
import router from "next/router";
import { useTranslation } from "hooks/useTranslation";

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

    const query = { ...router.query, station: inputValue };

    await router.replace({ query }, undefined, { shallow: false });
    setIsEditMode(false);

    // Hack: refresh page to load new data
    window.location.reload();
  };

  return (
    <div className={styles.wrap}>
      {!isEditMode && (
        <>
          <p>
            <strong>
              <button className="link" onClick={() => setIsEditMode(true)}>
                {stationName || t("changeStation")}
              </button>
            </strong>
          </p>

          <p>
            {totalDetections} {t("observations")} · {speciesData?.length || 0}{" "}
            {t("species")}
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
