import React from "react";
import Link from "next/link";

import styles from "./Footer.module.scss";
import { useQueryParam } from "hooks/useQueryParams";

export const Footer: React.FC = () => {
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.footer}>
      <p>
        <Link href={`/${lang ? `?lang=${lang}` : ""}`}>BirdTunes</Link>
      </p>
      <a
        href="https://github.com/tommyno/birdtunes"
        className="link"
        target="_blank"
      >
        Github ↗
      </a>
    </div>
  );
};
