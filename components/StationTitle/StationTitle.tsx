import React, { useState } from "react";
import Link from "next/link";

import { Species } from "types/api";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";
import { cleanStationName, getPageTitle } from "utils/species";
import { buildHref } from "utils/url";
import { FavouriteButton } from "components/FavouriteButton";
import styles from "./StationTitle.module.scss";

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
  const [lang] = useQueryParam({ key: "lang" });

  const [isExpanded, setIsExpanded] = useState(false);

  const totalDetections = speciesData?.reduce(
    (total, species) => total + species.detections.total,
    0,
  );

  const displayName = cleanStationName(stationName ?? undefined) || t("loading");

  const handleShare = async () => {
    const url = window.location.href;
    const title = getPageTitle(displayName);
    const text = displayName;

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
          {displayName}
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
          <Link
            href={buildHref("/map", { station: stationId, lang })}
            className={styles.iconButton}
          >
            <img src="/icons/pin.svg" className={styles.icon} alt="" />
            {t("map")}
          </Link>

          <button onClick={handleShare} className={styles.iconButton}>
            <img src="/icons/share.svg" alt="" className={styles.icon} />
            {t("share")}
          </button>

          <FavouriteButton
            stationId={stationId || ""}
            stationName={displayName}
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
