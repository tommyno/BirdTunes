import React from "react";

import { BirdModalData } from "types/birdModal";
import { useTranslation } from "hooks/useTranslation";
import { timeAgo } from "utils/date";
import { useModal } from "contexts/ModalContext";
import styles from "./BirdCard.module.scss";

type Props = {
  data: BirdModalData;
};

export const BirdCard: React.FC<Props> = ({ data }) => {
  const { openBirdModal } = useModal();
  const { t } = useTranslation();

  const handleClick = () => {
    openBirdModal(data);
  };

  // role="button" doesn't give a div keyboard support, so add it here
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    openBirdModal(data);
  };

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.wrap}>
        <div
          className={styles.imageWrap}
          style={{ backgroundColor: `${data.color}40` }} // Reduce intensity of color
        >
          <img
            src={data.imageUrl}
            alt={data.commonName}
            className={`${styles.image} fade-in-image fade-in-image-remove`}
            loading="lazy"
            width={400}
            height={400}
            onLoad={(e) =>
              e.currentTarget.classList.remove("fade-in-image-remove")
            }
          />

          <div className={styles.observations}>
            <img src="/icons/eye.svg" alt="" />
            {data.detections.total}
          </div>
        </div>

        <h3 className={styles.title}>{data.commonName}</h3>

        <p className={styles.heardFor}>{timeAgo(data.latestDetectionAt, t)}</p>
      </div>
    </div>
  );
};
