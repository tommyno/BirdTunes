import React from "react";
import { classNames } from "utils/classNames";
import styles from "./ModalAudioPlayer.module.scss";
import { useTranslation } from "hooks/useTranslation";
import { Detection } from "hooks/useFetchDetections";

type ModalAudioPlayerProps = {
  currentDetection: Detection | null;
  isPlaying: boolean;
  stopAndClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioEnded: () => void;
};

export const ModalAudioPlayer: React.FC<ModalAudioPlayerProps> = ({
  currentDetection,
  isPlaying,
  stopAndClose,
  audioRef,
  handleAudioPlay,
  handleAudioPause,
  handleAudioEnded,
}) => {
  const { t } = useTranslation();

  const playerClass = classNames(
    styles.player,
    isPlaying && styles["-playing"],
    !currentDetection && styles["-hidden"]
  );

  return (
    <div className={playerClass}>
      {currentDetection && (
        <div className={styles.controls}>
          <div className={styles.info}>
            <p className={styles.description}>
              {t("detectedSeconds")} {currentDetection.soundscape.startTime}{" "}
              {t("seconds")}
            </p>
          </div>

          <button
            onClick={stopAndClose}
            className={styles.closeButton}
            aria-label={t("close")}
            tabIndex={0}
          >
            <img src="/icons/close.svg" alt="" />
          </button>
        </div>
      )}

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onEnded={handleAudioEnded}
        onPause={handleAudioPause}
        onPlay={handleAudioPlay}
        className={styles.nativeAudioPlayer}
      />
    </div>
  );
};
