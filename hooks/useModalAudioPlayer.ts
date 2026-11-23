import { useState, useRef, useEffect } from "react";
import {
  createAudioProcessor,
  calculateNormalizationGain,
  calculateWaveformPeaks,
} from "utils/audio";
import { Detection } from "types/api";
import { ClipInfo } from "types/audio";

const PLAYER_STARTED_EVENT = "modal-audio-player-started";
// Playback position is rounded to this, so React skips re-renders that
// wouldn't change what the waveform shows
const CURRENT_TIME_PRECISION_SECONDS = 0.1;

type UseModalAudioPlayerProps = {
  detections: Detection[] | null;
};

type UseModalAudioPlayerReturn = {
  currentDetection: Detection | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  clips: Record<number, ClipInfo>;
  playDetection: (detection: Detection) => void;
  seek: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioEnded: () => void;
  handleAudioLoadedMetadata: () => void;
  handleAudioSeeked: () => void;
  handleAudioError: () => void;
};

export const useModalAudioPlayer = ({
  detections,
}: UseModalAudioPlayerProps): UseModalAudioPlayerReturn => {
  const [currentDetection, setCurrentDetection] = useState<Detection | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clips, setClips] = useState<Record<number, ClipInfo>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const processorRef = useRef<ReturnType<typeof createAudioProcessor> | null>(
    null
  );
  const blobUrlRef = useRef<string | null>(null);
  // Read after awaits, so a slow response for an earlier tap doesn't replace
  // the clip the user tapped last
  const currentDetectionIdRef = useRef<number | null>(null);
  // Tracks whether we fell back to dynamic gain (e.g. iOS PWA where decodeAudioData fails for FLAC)
  const isDynamicGainRef = useRef(false);

  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const stopDynamicGain = () => {
    processorRef.current?.stopDynamicGain();
    isDynamicGainRef.current = false;
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

  // Follow the playback position every frame while playing, so the waveform
  // fills smoothly (the audio "timeupdate" event only fires ~4 times a second)
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrame: number;

    const updateCurrentTime = () => {
      if (audioRef.current) {
        const steps = Math.round(
          audioRef.current.currentTime / CURRENT_TIME_PRECISION_SECONDS
        );
        setCurrentTime(steps * CURRENT_TIME_PRECISION_SECONDS);
      }
      animationFrame = requestAnimationFrame(updateCurrentTime);
    };

    updateCurrentTime();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  // Back to no clip selected; the next tap on any row loads its file again
  const resetPlayback = () => {
    currentDetectionIdRef.current = null;
    setCurrentDetection(null);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    stopDynamicGain();
    revokeBlobUrl();
  };

  // Reset state when detections change (modal closes/opens)
  useEffect(() => {
    if (!detections) {
      resetPlayback();
      setClips({});
    }
  }, [detections]);

  // play() rejects when a pause() interrupts it before playback starts, which
  // is expected when tapping play/pause quickly
  const startPlayback = async () => {
    try {
      await audioRef.current?.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[audio] play() failed:", error);
    }
  };

  const resumeOrPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    startPlayback();
  };

  const playDetection = async (detection: Detection) => {
    if (!audioRef.current || !detection.soundscape?.url) return;

    const audio = audioRef.current;
    const isSameDetection = currentDetection?.id === detection.id;

    // Still fetching this one, ignore repeated taps
    if (isSameDetection && isLoading) return;

    // Notify other players to stop
    window.dispatchEvent(new Event(PLAYER_STARTED_EVENT));

    // Already loaded: toggle without fetching the file again
    if (isSameDetection) {
      resumeOrPause();
      return;
    }

    // Stop any active dynamic gain and clean up previous playback
    stopDynamicGain();
    audio.pause();
    audio.src = "";
    revokeBlobUrl();

    currentDetectionIdRef.current = detection.id;
    setCurrentDetection(detection);
    setCurrentTime(0);
    setIsLoading(true);

    // Ensure processor and its AudioContext are available
    if (!processorRef.current) {
      processorRef.current = createAudioProcessor({ audioElement: audio });
    }
    const processor = processorRef.current;
    const isStillWanted = () => currentDetectionIdRef.current === detection.id;

    try {
      const response = await fetch(detection.soundscape.url);
      const arrayBuffer = await response.arrayBuffer();

      // Decode the full file to calculate whole-file RMS normalization.
      // slice(0) passes a copy so the original arrayBuffer stays intact for the Blob below.
      const decoded = await processor.context.decodeAudioData(
        arrayBuffer.slice(0)
      );

      // Keep the waveform even if the user has moved on to another row
      const clipInfo: ClipInfo = {
        duration: decoded.duration,
        peaks: calculateWaveformPeaks({ buffer: decoded }),
      };
      setClips((previousClips) => ({
        ...previousClips,
        [detection.id]: clipInfo,
      }));
      if (!isStillWanted()) return;

      const gain = calculateNormalizationGain({ buffer: decoded });
      processor.setGain(gain);

      // slice(0) copies the buffer before creating the Blob — some browsers detach
      // the ArrayBuffer during decodeAudioData, making the original unusable.
      const blob = new Blob([arrayBuffer.slice(0)], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;

      audio.src = blobUrl;
    } catch {
      if (!isStillWanted()) return;

      // decodeAudioData fails in some environments (e.g. iOS PWA + FLAC files).
      // Fall back to dynamic gain: stream the original URL and adjust gain in real time.
      // handleAudioPlay starts the gain loop; the duration is picked up in
      // handleAudioLoadedMetadata instead.
      processor.setGain(1);
      isDynamicGainRef.current = true;
      audio.src = detection.soundscape.url;
    }

    setIsLoading(false);
    await startPlayback();
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  // Runs for every resume, also from the lock screen, so the fallback gain
  // loop is (re)started here rather than in each place that calls play()
  const handleAudioPlay = () => {
    setIsPlaying(true);
    if (isDynamicGainRef.current) {
      processorRef.current?.startDynamicGain();
    }
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
    // Stop the RAF while paused to avoid wasting CPU
    processorRef.current?.stopDynamicGain();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    stopDynamicGain();
    // Return the row to its idle look. The audio itself needs no rewind:
    // play() on an ended element starts from the beginning.
    setCurrentTime(0);
  };

  // The browser may land slightly off the requested time (e.g. on a frame
  // boundary), so show where it actually ended up
  const handleAudioSeeked = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Only needed in the streaming fallback, where we have no decoded buffer to
  // read the duration from
  const handleAudioLoadedMetadata = () => {
    const audio = audioRef.current;
    const detectionId = currentDetectionIdRef.current;
    if (!audio || detectionId === null || !Number.isFinite(audio.duration)) {
      return;
    }

    // Functional update: this event can fire before the decoded clip info
    // from playDetection has been rendered, and that one has the waveform
    setClips((previousClips) =>
      previousClips[detectionId]
        ? previousClips
        : {
            ...previousClips,
            [detectionId]: { duration: audio.duration, peaks: null },
          }
    );
  };

  // The file can fail during playback (e.g. a dropped connection). Without a
  // reset, the next tap would try to resume the broken file instead of
  // loading it again.
  const handleAudioError = () => {
    // Clearing src between clips also fires "error"; that one is expected
    if (!audioRef.current?.getAttribute("src")) return;
    resetPlayback();
  };

  return {
    currentDetection,
    isPlaying,
    isLoading,
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
  };
};
