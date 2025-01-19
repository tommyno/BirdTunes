import { useState, useRef, useEffect } from "react";
import styles from "./AudioPlayer.module.scss";
import { useTranslation } from "hooks/useTranslation";
import { createAudioProcessor } from "utils/audio";

type AudioPlayerProps = {
  url: string;
  startTime?: number;
};

export const AudioPlayer = ({ url, startTime = 0 }: AudioPlayerProps) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const processorRef = useRef<ReturnType<typeof createAudioProcessor> | null>(
    null
  );

  useEffect(() => {
    if (audioRef.current && !processorRef.current) {
      processorRef.current = createAudioProcessor({
        audioElement: audioRef.current,
      });

      processorRef.current.startAutoGain();
    }
  }, []);

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
        <button
          onClick={handlePlayPause}
          className={styles.playButton}
          aria-label={isPlaying ? t("pause") : t("play")}
        >
          <img
            src={isPlaying ? "/icons/close.svg" : "/icons/play.svg"}
            alt=""
          />
        </button>
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      </div>

      {isPlaying && (
        <p className="color-muted">
          <small>
            {t("detectedSeconds")} {startTime} {t("seconds")}
          </small>
        </p>
      )}
    </>
  );
};
