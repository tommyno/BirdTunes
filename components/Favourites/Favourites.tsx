import React from "react";

import styles from "./Favourites.module.scss";
import { getItem } from "hooks/useLocalStorage";
import { useTranslation } from "hooks/useTranslation";
import Link from "next/link";
import { useQueryParam } from "hooks/useQueryParams";

type Favourite = { stationId: string; stationName: string };

export const Favourites: React.FC = () => {
  const { t } = useTranslation();
  const favourites: Favourite[] = getItem("birdtunes-favourites");
  const [lang] = useQueryParam({ key: "lang" });

  if (favourites.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <h2>{t("favourites")}</h2>

      <div className={styles.favourites}>
        {favourites.map(({ stationId, stationName }) => (
          <Link
            className={styles.link}
            href={`?station=${stationId}${lang ? `&lang=${lang}` : ""}`}
            key={stationId}
          >
            {stationName} <span className={styles.stationId}>#{stationId}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
