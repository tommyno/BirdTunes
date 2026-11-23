import React, { useState } from "react";

import { Detection } from "types/api";
import { ClipInfo } from "types/audio";
import { useTranslation } from "hooks/useTranslation";
import { WAVEFORM_BAR_COUNT } from "utils/audio";
import { classNames } from "utils/classNames";
import { dateShort, formatSeconds, timeDetailed } from "utils/date";
import styles from "./DetectionRow.module.scss";

const KEYBOARD_SEEK_STEP_SECONDS = 1;
const SEEK_STEP_BY_KEY: Record<string, number> = {
  ArrowRight: KEYBOARD_SEEK_STEP_SECONDS,
  ArrowLeft: -KEYBOARD_SEEK_STEP_SECONDS,
};
const PLACEHOLDER_PEAKS: number[] = Array(WAVEFORM_BAR_COUNT).fill(0);

// isPlaying, isLoading and currentTime describe this row only
type Props = {
  detection: Detection;
  locale?: string | null;
  clip?: ClipInfo;
  isCurrent: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
};

export const DetectionRow: React.FC<Props> = ({
  detection,
  locale,
  clip,
  isCurrent,
  isPlaying,
  isLoading,
  currentTime,
  onTogglePlay,
  onSeek,
}) => {
  const { t } = useTranslation();
  // Position under the finger while dragging, shown instead of the audio's
  // own position so the waveform follows the finger without lag
  const [scrubTime, setScrubTime] = useState<number | null>(null);

  const date = dateShort(detection.timestamp, locale);
  const time = timeDetailed(detection.timestamp, locale);

  const when = (
    <span className={styles.when}>
      <span className={styles.time}>{time}</span>
      <span className={styles.date}>{date}</span>
    </span>
  );

  // Some detections have no recording, show when it happened without a player
  if (!detection.soundscape?.url) {
    return (
      <div className={styles.row}>
        <span className={classNames(styles.icon, styles["-empty"])} />
        {when}
      </div>
    );
  }

  const duration = clip?.duration ?? 0;
  const canSeek = isCurrent && duration > 0;
  const displayTime = scrubTime ?? currentTime;
  const isActive = isPlaying || isLoading || displayTime > 0;
  const peaks = clip?.peaks ?? PLACEHOLDER_PEAKS;

  const clampToClip = (time: number) => Math.min(duration, Math.max(0, time));

  const getTimeAtPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    return ((event.clientX - left) / width) * duration;
  };

  const scrubTo = (event: React.PointerEvent<HTMLDivElement>) => {
    const time = clampToClip(getTimeAtPointer(event));
    setScrubTime(time);
    onSeek(time);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Nothing to scrub until the clip is loaded, so a tap starts playback instead
    if (!canSeek) {
      onTogglePlay();
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scrubTime === null) return;
    scrubTo(event);
  };

  const handlePointerEnd = () => {
    setScrubTime(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = SEEK_STEP_BY_KEY[event.key];
    if (!canSeek || !step) return;

    event.preventDefault();
    onSeek(clampToClip(displayTime + step));
  };

  const getBarMiddleTime = (index: number) =>
    ((index + 0.5) / peaks.length) * duration;

  const isBarPlayed = (index: number) =>
    duration > 0 && getBarMiddleTime(index) <= displayTime;

  // Short clips are often detected from start to end, then there is no
  // part of the clip worth pointing out
  const { startTime, endTime } = detection.soundscape;
  const detectionEndTime = Math.min(endTime, duration);
  const showDetection =
    duration > 0 && (startTime > 0 || detectionEndTime < duration);

  const isBarInDetection = (index: number) => {
    if (!showDetection) return false;
    const barMiddleTime = getBarMiddleTime(index);
    return barMiddleTime >= startTime && barMiddleTime < detectionEndTime;
  };

  const timeLabel = duration
    ? formatSeconds(isActive ? duration - displayTime : duration)
    : "";

  const rowClass = classNames(styles.row, isActive && styles["-active"]);
  const waveformClass = classNames(
    styles.waveform,
    isLoading && styles["-loading"]
  );

  return (
    <div className={rowClass}>
      <button
        className={styles.playButton}
        onClick={onTogglePlay}
        aria-label={`${t(isPlaying ? "pause" : "play")} ${date} ${time}`}
      >
        <span className={styles.icon}>
          {isLoading ? (
            <span className={styles.spinner} />
          ) : (
            <img
              src={isPlaying ? "/icons/pause.svg" : "/icons/play.svg"}
              alt=""
            />
          )}
        </span>

        {when}
      </button>

      <div
        className={waveformClass}
        role="slider"
        tabIndex={canSeek ? 0 : -1}
        aria-label={t("audioPosition")}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(displayTime)}
        aria-valuetext={`${formatSeconds(displayTime)} / ${formatSeconds(duration)}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {showDetection && (
          <span
            className={styles.detection}
            style={{
              left: `${(startTime / duration) * 100}%`,
              width: `${((detectionEndTime - startTime) / duration) * 100}%`,
            }}
          />
        )}

        {peaks.map((peak, index) => (
          <span
            key={index}
            className={classNames(
              styles.bar,
              isBarInDetection(index) && styles["-detected"],
              isBarPlayed(index) && styles["-played"]
            )}
            style={{ height: `${Math.max(0.12, peak) * 100}%` }}
          />
        ))}
      </div>

      <span className={styles.duration}>{timeLabel}</span>
    </div>
  );
};
