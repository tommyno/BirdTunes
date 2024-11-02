import React from "react";

import styles from "./BirdCardGrid.module.scss";

type Props = {
  children: React.ReactNode;
};

export const BirdCardGrid: React.FC<Props> = ({ children }) => {
  return <div className={styles.wrap}>{children}</div>;
};
