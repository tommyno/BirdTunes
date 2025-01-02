import { Species } from "hooks/useFetchSpecies";

import { Modal } from "components/Modal/Modal";
import styles from "./BirdModal.module.scss";
import { dateDetailed } from "utils/date";
import { useFetchDetections } from "hooks/useFetchDetections";
import { Spinner } from "components/Spinner";

type BirdModalProps = {
  bird: Species;
  isOpen: boolean;
  onClose: () => void;
};

export function BirdModal({ bird, isOpen, onClose }: BirdModalProps) {
  const { data, isLoading, error } = useFetchDetections(bird.id);

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
        </div>

        <div className={styles.detections}>
          <h2 className="h4">Siste {data?.length} observasjoner</h2>
          {isLoading && <Spinner />}
          {data?.map((detection) => (
            <div key={detection.id}>
              <p>{dateDetailed(detection.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
