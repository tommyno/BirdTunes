import useSWR from "swr";

import { API_BASE_URL } from "constants/birdweather";
import { Modal } from "components/Modal/Modal";
import { Spinner } from "components/Spinner";
import { Block } from "components/Block";
import { DetectionRow } from "components/DetectionRow";
import { useTranslation } from "hooks/useTranslation";
import { useModalAudioPlayer } from "hooks/useModalAudioPlayer";
import { Species, Detection } from "types/api";
import { fetcher } from "utils/fetcher";
import styles from "./BirdModal.module.scss";

type DetectionsResponse = {
  detections: Detection[];
};

type BirdModalProps = {
  data: Species & { stationId: string | null; lang: string | null };
  isOpen: boolean;
  onClose: () => void;
};

export function BirdModal({ data: bird, isOpen, onClose }: BirdModalProps) {
  const { t } = useTranslation();

  const shouldFetch = bird.id && bird.stationId && bird.lang;
  const detectionsUrl = shouldFetch
    ? `${API_BASE_URL}/stations/${bird.stationId}/detections?limit=5&speciesId=${bird.id}&locale=${bird.lang}&order=desc`
    : null;

  const {
    data: detectionsData,
    isLoading,
    error,
  } = useSWR<DetectionsResponse>(detectionsUrl, fetcher);

  const detections = detectionsData?.detections ?? null;

  const {
    currentDetection,
    isPlaying,
    isLoading: isAudioLoading,
    currentTime,
    clips,
    playDetection,
    seek,
    audioRef,
    handleAudioPlay,
    handleAudioPause,
    handleAudioEnded,
    handleAudioLoadedMetadata,
    handleAudioSeeked,
    handleAudioError,
  } = useModalAudioPlayer({ detections });

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
                className="link"
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
              {t("last")} {detections?.length} {t("detections")}
            </h2>
          </Block>

          {isLoading && <Spinner />}

          {error && (
            <p className="color-red">
              Det skjedde en feil ved henting av data.
            </p>
          )}

          {detections?.map((detection) => {
            const isCurrent = currentDetection?.id === detection.id;

            return (
              <DetectionRow
                key={detection.id}
                detection={detection}
                locale={bird.lang}
                clip={clips[detection.id]}
                isCurrent={isCurrent}
                isPlaying={isCurrent && isPlaying}
                isLoading={isCurrent && isAudioLoading}
                currentTime={isCurrent ? currentTime : 0}
                onTogglePlay={() => playDetection(detection)}
                onSeek={seek}
              />
            );
          })}
        </div>

        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onSeeked={handleAudioSeeked}
          onError={handleAudioError}
        />
      </div>
    </Modal>
  );
}
