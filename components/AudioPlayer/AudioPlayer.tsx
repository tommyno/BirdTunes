import { useState, useRef } from "react";
import styles from "./AudioPlayer.module.scss";
import { useTranslation } from "hooks/useTranslation";

type AudioPlayerProps = {
  url: string;
  startTime?: number;
};

export const AudioPlayer = ({ url, startTime = 0 }: AudioPlayerProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (!isLoaded) {
      audioRef.current.src = url;
      setIsLoaded(true);
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.controls = false;
    } else {
      audioRef.current.controls = true;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <div className={styles.player}>
        {!isLoaded && (
          <button
            onClick={handlePlayPause}
            className={styles.playButton}
            aria-label={isPlaying ? t("pause") : t("play")}
          >
            <img src="/icons/play.svg" alt="" />
          </button>
        )}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
      {isLoaded && (
        <p className="color-muted">
          <small>
            {t("detectedSeconds")} {startTime} {t("seconds")}
          </small>
        </p>
      )}
    </>
  );
};
