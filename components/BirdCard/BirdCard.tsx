import React from "react";

import styles from "./BirdCard.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { timeAgo } from "utils/date";

type Props = {
  data: Species;
};

export const BirdCard: React.FC<Props> = ({ data }) => {
  return (
    <div className={styles.wrap}>
      <img src={data.imageUrl} alt={data.commonName} className={styles.image} />

      <h3 className={styles.title}>{data.commonName}</h3>

      <div className={styles.latin}>{data.scientificName}</div>

      <p>{data.detections.total} observasjoner</p>

      <p>Hørt for {timeAgo(data.latestDetectionAt)}</p>
    </div>
  );
};
