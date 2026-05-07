import { useState, useRef, useEffect } from "react";
import { createAudioProcessor, calculateNormalizationGain } from "utils/audio";
import { Detection } from "types/api";

const PLAYER_STARTED_EVENT = "modal-audio-player-started";

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
  const blobUrlRef = useRef<string | null>(null);


  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  // Initialize audio processor once the audio element is available
  useEffect(() => {
    if (audioRef.current && !processorRef.current) {
      processorRef.current = createAudioProcessor({
        audioElement: audioRef.current,
      });
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

    window.addEventListener(PLAYER_STARTED_EVENT, handleOtherPlayerStarted);
    return () => {
      window.removeEventListener(PLAYER_STARTED_EVENT, handleOtherPlayerStarted);
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
      revokeBlobUrl();
    }
  }, [detections]);

  const playDetection = async (detection: Detection) => {
    if (!audioRef.current || !detection.soundscape?.url) return;

    const audio = audioRef.current;

    // Notify other players to stop
    window.dispatchEvent(new Event(PLAYER_STARTED_EVENT));

    // If clicking the same detection while playing, pause it
    if (currentDetection?.id === detection.id && isPlaying) {
      audio.pause();
      return;
    }

    // Stop current playback and clean up previous blob URL
    audio.pause();
    audio.src = "";
    revokeBlobUrl();

    setCurrentDetection(detection);
    setIsLoaded(false);

    try {
      const response = await fetch(detection.soundscape.url);
      const arrayBuffer = await response.arrayBuffer();

      // Ensure processor and its AudioContext are available
      if (!processorRef.current) {
        processorRef.current = createAudioProcessor({ audioElement: audio });
      }
      const processor = processorRef.current;

      // Decode the full file to calculate whole-file RMS normalization.
      // slice(0) passes a copy so the original arrayBuffer stays intact for the Blob below.
      const decoded = await processor.context.decodeAudioData(
        arrayBuffer.slice(0)
      );
      const gain = calculateNormalizationGain({ buffer: decoded });
      processor.setGain(gain);

      // slice(0) copies the buffer before creating the Blob — some browsers detach
      // the ArrayBuffer during decodeAudioData, making the original unusable.
      const blob = new Blob([arrayBuffer.slice(0)], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      audio.src = blobUrl;
      audio.controls = true;
      setIsLoaded(true);

      await audio.play();
    } catch (err) {
      console.error("Error loading or playing audio:", err);
      setIsLoaded(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentDetection) return;

    if (!isPlaying) {
      window.dispatchEvent(new Event(PLAYER_STARTED_EVENT));
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.controls = false;
    } else {
      audioRef.current.controls = true;
      audioRef.current.play();
    }
  };

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
    revokeBlobUrl();
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
