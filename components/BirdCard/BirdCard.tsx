import React from "react";
import styles from "./BirdCard.module.scss";
import { Species } from "hooks/useFetchSpecies";
import { timeAgo } from "utils/date";
import { useModal } from "contexts/ModalContext";
import { useTranslation } from "hooks/useTranslation";

type Props = {
  data: Species & { stationId: string | null; lang: string | null };
};

export const BirdCard: React.FC<Props> = ({ data }) => {
  const { openModal } = useModal();
  const { t } = useTranslation();

  return (
    <div
      className={styles.card}
      onClick={() => openModal("bird", data)}
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

        <div className={styles.latin}>
          <a
            href={`${t("wikiUrl")}/${data.commonName.toLowerCase()}`}
            target="_blank"
            rel="noreferrer"
            title={t("wikiTitle")}
          >
            {data.scientificName}
          </a>
        </div>

        <p>
          {t("heardFor")} {timeAgo(data.latestDetectionAt)}
        </p>
      </div>
    </div>
  );
};
