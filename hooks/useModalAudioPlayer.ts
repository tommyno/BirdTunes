import { useState, useRef, useEffect } from "react";
import { createAudioProcessor } from "utils/audio";
import { Detection } from "hooks/useFetchDetections";

type UseModalAudioPlayerProps = {
  detections: Detection[] | null;
};

type UseModalAudioPlayerReturn = {
  currentDetection: Detection | null;
  isPlaying: boolean;
  isLoaded: boolean;
  playDetection: (detection: Detection) => void;
  togglePlayPause: () => void;
  stopAndClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioEnded: () => void;
};

export const useModalAudioPlayer = ({
  detections,
}: UseModalAudioPlayerProps): UseModalAudioPlayerReturn => {
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const processorRef = useRef<ReturnType<typeof createAudioProcessor> | null>(
    null
  );

  const playerStartedEvent = "modal-audio-player-started";

  // Initialize audio processor
  useEffect(() => {
    if (audioRef.current && !processorRef.current) {
      processorRef.current = createAudioProcessor({
        audioElement: audioRef.current,
      });
      processorRef.current.startAutoGain();
    }
  }, []);

  // Listen for other players starting
  useEffect(() => {
    const handleOtherPlayerStarted = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }
    };

    window.addEventListener(playerStartedEvent, handleOtherPlayerStarted);
    return () => {
      window.removeEventListener(playerStartedEvent, handleOtherPlayerStarted);
    };
  }, []);

  // Reset state when detections change (modal closes/opens)
  useEffect(() => {
    if (!detections) {
      setCurrentDetection(null);
      setIsPlaying(false);
      setIsLoaded(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.controls = false;
      }
    }
  }, [detections]);

  const playDetection = (detection: Detection) => {
    if (!audioRef.current || !detection.soundscape?.url) return;

    // Notify other players to stop
    window.dispatchEvent(new Event(playerStartedEvent));

    // If clicking the same detection and it's playing, pause it
    if (currentDetection?.id === detection.id && isPlaying) {
      audioRef.current.pause();
      return;
    }

    // Set new detection and load its audio
    setCurrentDetection(detection);
    audioRef.current.src = detection.soundscape.url;
    setIsLoaded(true);
    audioRef.current.controls = true;
    audioRef.current.play().catch((err) => {
      console.error("Error playing audio:", err);
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentDetection) return;

    if (!isPlaying) {
      // Notify other players to stop
      window.dispatchEvent(new Event(playerStartedEvent));
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.controls = false;
    } else {
      audioRef.current.controls = true;
      audioRef.current.play();
    }
  };

  // Audio event handlers
  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const stopAndClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.controls = false;
    }
    setCurrentDetection(null);
    setIsPlaying(false);
    setIsLoaded(false);
  };

  return {
    currentDetection,
    isPlaying,
    isLoaded,
    playDetection,
    togglePlayPause,
    stopAndClose,
    audioRef,
    handleAudioPlay,
    handleAudioPause,
    handleAudioEnded,
  };
};
