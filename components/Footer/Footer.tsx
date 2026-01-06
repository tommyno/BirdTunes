import React from "react";

import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
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
