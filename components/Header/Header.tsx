import React from "react";

import styles from "./Header.module.scss";
import { LanguageSwitcher } from "components/LanguageSwitcher";
import Link from "next/link";
import { useQueryParam } from "hooks/useQueryParams";

type Props = {
  showArrow?: string;
};

export const Header: React.FC<Props> = ({ showArrow = true }) => {
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.header}>
      <h1 className="h3">
        <Link
          href={`/${lang ? `?lang=${lang}` : ""}`}
          className={styles.logoWrap}
        >
          {showArrow && (
            <img
              src="/icons/arrow-up.svg"
              alt="Go back to homepage"
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
