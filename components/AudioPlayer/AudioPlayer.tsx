import { useState, useRef } from "react";
import styles from "./AudioPlayer.module.scss";

type AudioPlayerProps = {
  url: string;
};

export const AudioPlayer = ({ url }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

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
        aria-label={isPlaying ? "Pause" : "Spill av"}
      >
        {isPlaying ? (
          <img src="/icons/pause.svg" alt="" />
        ) : (
          <img src="/icons/play.svg" alt="" />
        )}
      </button>
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
};
