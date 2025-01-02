import { Species } from "hooks/useFetchSpecies";
import { Modal } from "components/Modal/Modal";
import styles from "./BirdModal.module.scss";
import { Flow } from "components/Flow";
import { Flex } from "components/Flex";
import { timeAgo } from "utils/date";

type BirdModalProps = {
  bird: Species;
  isOpen: boolean;
  onClose: () => void;
};

export function BirdModal({ bird, isOpen, onClose }: BirdModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <img
          src={bird.imageUrl}
          alt={bird.commonName}
          className={styles.image}
          loading="eager"
          width={400}
          height={400}
        />

        <div className={styles.header}>
          <h2>{bird.commonName}</h2>

          <p className="color-muted">
            <em>
              <a
                href={`https://snl.no/${bird.commonName.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                title="Gå til Store norske leksikon"
              >
                {bird.scientificName}
              </a>
            </em>
          </p>

          <p>{bird.detections.total} observasjoner</p>

          <p>Hørt for {timeAgo(bird.latestDetectionAt)}</p>
        </div>
      </div>
    </Modal>
  );
}
