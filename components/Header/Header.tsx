import React from "react";

import styles from "./Header.module.scss";
import { LanguageSwitcher } from "components/LanguageSwitcher";
import Link from "next/link";
import { useQueryParam } from "hooks/useQueryParams";

export const Header: React.FC = () => {
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.header}>
      <h1 className="h3">
        <Link href={`/${lang ? `?lang=${lang}` : ""}`}>BirdTunes</Link>
      </h1>
      <LanguageSwitcher />
    </div>
  );
};
