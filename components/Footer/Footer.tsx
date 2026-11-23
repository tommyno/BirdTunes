import React from "react";
import Link from "next/link";

import { useQueryParam } from "hooks/useQueryParams";
import { buildHref } from "utils/url";
import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
  const [lang] = useQueryParam({ key: "lang" });

  return (
    <div className={styles.footer}>
      <p>
        <Link href={buildHref("/", { lang })}>BirdTunes</Link>
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
