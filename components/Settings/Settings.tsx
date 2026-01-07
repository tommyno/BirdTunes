import React from "react";
import styles from "./Settings.module.scss";
import { Species } from "types/api";
import { useTranslation } from "hooks/useTranslation";

type Props = {
  speciesData?: Species[];
  speciesError?: Error | null;
  stationId?: string | null;
  stationName?: string | null;
  isLoadingSpecies?: boolean;
};

export const Settings: React.FC<Props> = ({
  speciesData,
  speciesError,
  stationId,
  stationName,
  isLoadingSpecies,
}) => {
  const { t } = useTranslation();

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  // Remove "BirdNET-Pi - " from stationName
  const cleanStationName =
    stationName?.replace("BirdNET-Pi - ", "") || t("loading");

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        {cleanStationName}
        <a
          href={`https://app.birdweather.com${
            speciesError || !stationId ? "" : `/stations/${stationId}`
          }`}
          className={styles.stationLink}
          target="_blank"
          rel="noopener noreferrer"
          title="View on BirdWeather"
        >
          ↗
        </a>
      </h2>

      {!isLoadingSpecies && (
        <p>
          {speciesData?.length || 0} {t("species")} · {totalDetections}{" "}
          {t("detections")}
        </p>
      )}

      {speciesError && <p className="color-red">{speciesError.toString()}</p>}
    </div>
  );
};
