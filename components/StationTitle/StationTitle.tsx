import React from "react";
import styles from "./StationTitle.module.scss";
import { Species } from "types/api";
import { useTranslation } from "hooks/useTranslation";

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
      <div className={styles.titleWrap}>
        <h2 className={styles.title}>{cleanStationName}</h2>

        {stationName && (
          <div className={styles.iconWrap}>
            <a
              href={`https://app.birdweather.com${
                speciesError || !stationId ? "" : `/stations/${stationId}`
              }`}
              className={styles.stationLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in map"
            >
              <img
                src="/icons/pin.svg"
                className={styles.shareIcon}
                alt="Open in map"
              />
            </a>
            <button onClick={handleShare}>
              <img
                src="/icons/share.svg"
                alt="Share"
                title="Share url"
                className={styles.shareIcon}
              />
            </button>
          </div>
        )}
      </div>

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
