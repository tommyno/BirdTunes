import React from "react";

import styles from "./Header.module.scss";
import { LanguageSwitcher } from "components/LanguageSwitcher";

export const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <h1 className="h3">BirdTunes</h1>
      <LanguageSwitcher />
    </div>
  );
};
