import { useState, useRef } from "react";
import styles from "./AudioPlayer.module.scss";
import { useTranslation } from "hooks/useTranslation";

type AudioPlayerProps = {
  url: string;
};

export const AudioPlayer = ({ url }: AudioPlayerProps) => {
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
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={styles.player}>
      <button
        onClick={handlePlayPause}
        className={styles.playButton}
        aria-label={isPlaying ? t("pause") : t("play")}
      >
        {isPlaying ? (
          <img src="/icons/pause.svg" alt="" />
        ) : (
          <img src="/icons/play.svg" alt="" />
        )}
      </button>
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
};
