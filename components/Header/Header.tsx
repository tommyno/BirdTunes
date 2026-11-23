import React from "react";
import Link from "next/link";

import { useTranslation } from "hooks/useTranslation";
import { useQueryParam } from "hooks/useQueryParams";
import { buildHref } from "utils/url";
import { LanguageSwitcher } from "components/LanguageSwitcher";
import styles from "./Header.module.scss";

type Props = {
  showArrow?: boolean;
};

export const Header: React.FC<Props> = ({ showArrow = true }) => {
  const { t } = useTranslation();
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.header}>
      <h1 className="h3">
        <Link href={buildHref("/", { lang })} className={styles.logoWrap}>
          {showArrow && (
            <img
              src="/icons/arrow-up.svg"
              alt={t("backToHomepage")}
              className={styles.arrow}
            />
          )}
          <span>BirdTunes</span>
        </Link>
      </h1>
      <LanguageSwitcher />
    </div>
  );
};
