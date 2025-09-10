import { Species } from "hooks/useFetchSpecies";

import { Modal } from "components/Modal/Modal";
import styles from "./BirdModal.module.scss";
import { dateDetailed } from "utils/date";
import { useFetchDetections } from "hooks/useFetchDetections";
import { Spinner } from "components/Spinner";
import { Block } from "components/Block";
import { useTranslation } from "hooks/useTranslation";
import { useModalAudioPlayer } from "hooks/useModalAudioPlayer";
import { ModalAudioPlayer } from "components/ModalAudioPlayer";
import { classNames } from "utils/classNames";

type BirdModalProps = {
  data: Species & { stationId: string | null; lang: string | null };
  isOpen: boolean;
  onClose: () => void;
};

export function BirdModal({ data: bird, isOpen, onClose }: BirdModalProps) {
  const { t } = useTranslation();

  const { data, isLoading, error } = useFetchDetections({
    speciesId: bird.id,
    stationId: bird.stationId,
    lang: bird.lang,
  });

  const {
    currentDetection,
    isPlaying,
    playDetection,
    stopAndClose,
    audioRef,
    handleAudioPlay,
    handleAudioPause,
    handleAudioEnded,
  } = useModalAudioPlayer({ detections: data });

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
                href={`${t("wikiUrl")}/${bird.commonName.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                title={t("wikiTitle")}
              >
                {bird.scientificName}
              </a>
            </em>
          </p>

          <p>
            {bird.detections.total} {t("detections")}
          </p>
        </div>

        <div className={styles.detections}>
          <Block bottom="3">
            <h2 className="h4">
              {t("last")} {data?.length} {t("detections")}
            </h2>
          </Block>

          {isLoading && <Spinner />}

          {error && (
            <p className="color-red">
              Det skjedde en feil ved henting av data.
            </p>
          )}

          {data?.map((detection) => {
            const isCurrentlyPlaying =
              currentDetection?.id === detection.id && isPlaying;

            return (
              <div key={detection.id} className={styles.detection}>
                <p>{dateDetailed(detection.timestamp, bird?.lang)}</p>
                {detection?.soundscape?.url && (
                  <button
                    onClick={() => playDetection(detection)}
                    className={classNames(
                      styles.playButton,
                      isCurrentlyPlaying && styles["-playing"]
                    )}
                    aria-label={isCurrentlyPlaying ? t("pause") : t("play")}
                  >
                    <img
                      src={
                        isCurrentlyPlaying
                          ? "/icons/pause.svg"
                          : "/icons/play.svg"
                      }
                      alt=""
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <ModalAudioPlayer
          currentDetection={currentDetection}
          isPlaying={isPlaying}
          stopAndClose={stopAndClose}
          audioRef={audioRef}
          handleAudioPlay={handleAudioPlay}
          handleAudioPause={handleAudioPause}
          handleAudioEnded={handleAudioEnded}
        />
      </div>
    </Modal>
  );
}
