import React from "react";
import Link from "next/link";

import { FAVOURITES_STORAGE_KEY } from "constants/storage";
import { Favourite } from "types/favourites";
import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";
import { useLocalStorageCache } from "hooks/useLocalStorageCache";
import { buildHref } from "utils/url";
import styles from "./Favourites.module.scss";

export const Favourites: React.FC = () => {
  const { t } = useTranslation();
  const favourites =
    useLocalStorageCache<Favourite[]>(FAVOURITES_STORAGE_KEY) ?? [];
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
            href={buildHref("/", { station: stationId, lang })}
            key={stationId}
          >
            {stationName} <span className={styles.stationId}>#{stationId}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
