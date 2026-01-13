import React, { useState } from "react";
import styles from "./StationTitle.module.scss";
import { Species } from "types/api";
import { useTranslation } from "hooks/useTranslation";
import { FavouriteButton } from "components/FavouriteButton/FavouriteButton";

type Props = {
  speciesData?: Species[];
  speciesError?: Error | null;
  stationId?: string | null;
  stationName?: string | null;
  isLoadingSpecies?: boolean;
};

export const StationTitle: React.FC<Props> = ({
  speciesData,
  speciesError,
  stationId,
  stationName,
  isLoadingSpecies,
}) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0
  );

  // Remove "BirdNET-Pi - " from station names
  const cleanStationName =
    stationName?.replace("BirdNET-Pi - ", "") || t("loading");

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${cleanStationName} | BirdTunes`;
    const text = cleanStationName;

    // Use native share dialog if available (mobile + some desktop browsers)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // User cancelled or share failed - fall through to clipboard
        if ((error as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy url to clipboard
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className={styles.titleButton}
          title={t("showMore")}
        >
          {cleanStationName}
          <img
            src="/icons/chevron-down.svg"
            alt=""
            className={styles.expandIcon}
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
      </h2>

      {stationName && isExpanded && (
        <div className={styles.iconWrap}>
          <a
            href={`https://app.birdweather.com${
              speciesError || !stationId ? "" : `/stations/${stationId}`
            }`}
            className={styles.iconButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/icons/pin.svg" className={styles.icon} alt="" />
            {t("map")}
          </a>

          <button onClick={handleShare} className={styles.iconButton}>
            <img src="/icons/share.svg" alt="" className={styles.icon} />
            {t("share")}
          </button>

          <FavouriteButton
            stationId={stationId || ""}
            stationName={cleanStationName}
          />
        </div>
      )}

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
