import React from "react";
import Link from "next/link";

import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";
import styles from "./MapLink.module.scss";

export const MapLink: React.FC = () => {
  const { t } = useTranslation();
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <Link
      href={`/map${lang ? `?lang=${lang}` : ""}`}
      className={styles.link}
      aria-label={t("showMap")}
    >
      <img src="/icons/pin.svg" className={styles.icon} alt="" />
      <span className={styles.label}>{t("showMap")}</span>
    </Link>
  );
};
