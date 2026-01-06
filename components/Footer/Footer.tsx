import React from "react";

import styles from "./Footer.module.scss";

type Props = {
  example?: string;
};

export const Footer: React.FC<Props> = () => {
  return (
    <div className={styles.footer}>
      <p>BirdTunes</p>
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
