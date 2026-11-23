// Loudness that quiet recordings are boosted towards, and the most they are
// boosted (protects against near-silent recordings)
const TARGET_DB = -10;
const MAX_GAIN = 75;

// Converts a loudness (RMS) to the linear gain needed to reach targetDb.
// Never below 1×, so already-loud recordings aren't attenuated.
const rmsToGain = (rms: number, targetDb: number, maxGain: number) => {
  // Convert RMS to decibels. The factor 20 is the standard scalar for
  // amplitude ratios (as opposed to 10 used for power ratios), because
  // dB = 10 * log10(power) and power ∝ amplitude², so 10 * 2 = 20.
  // We floor at 1e-6 to avoid log10(0) = -Infinity on silent recordings.
  const db = 20 * Math.log10(Math.max(rms, 1e-6));

  // Convert the dB difference back to a linear multiplier: gain = 10^(dB / 20)
  const gain = Math.pow(10, (targetDb - db) / 20);

  return Math.min(maxGain, Math.max(1, gain));
};

type AudioProcessor = {
  readonly context: AudioContext;
  setGain: (value: number) => void;
  startDynamicGain: () => void;
  stopDynamicGain: () => void;
};

// Routes the audio element through a gain node. Call once per element:
// an element can only be connected to one audio context.
export const createAudioProcessor = (
  audioElement: HTMLAudioElement
): AudioProcessor => {
  const context = new AudioContext();
  const source = context.createMediaElementSource(audioElement);
  const analyser = context.createAnalyser();
  const gain = context.createGain();

  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.7;

  source.connect(analyser);
  analyser.connect(gain);
  gain.connect(context.destination);

  let dynamicGainRAF: number | null = null;
  const dataArray = new Float32Array(analyser.frequencyBinCount);

  const updateDynamicGain = () => {
    analyser.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const targetGain = rmsToGain(rms, TARGET_DB, MAX_GAIN);

    // Asymmetric attack/release: slow to increase (2%), fast to decrease (25%).
    // This prevents gain from shooting up during leading silence and causing a pop
    // when the bird call suddenly arrives.
    const isIncreasing = targetGain > gain.gain.value;
    const alpha = isIncreasing ? 0.02 : 0.25;
    gain.gain.value = gain.gain.value * (1 - alpha) + targetGain * alpha;

    dynamicGainRAF = requestAnimationFrame(updateDynamicGain);
  };

  return {
    context,
    setGain: (value) => {
      gain.gain.value = value;
    },
    startDynamicGain: () => {
      if (!dynamicGainRAF) {
        updateDynamicGain();
      }
    },
    stopDynamicGain: () => {
      if (dynamicGainRAF) {
        cancelAnimationFrame(dynamicGainRAF);
        dynamicGainRAF = null;
      }
    },
  };
};

type CalculateNormalizationGainProps = {
  buffer: AudioBuffer;
  targetDb?: number;
  maxGain?: number;
};

// Calculates the linear gain multiplier needed to bring an AudioBuffer's
// average loudness (RMS) up to targetDb. Analyzes all channels across the
// full buffer so the gain is stable for the entire recording.
export const calculateNormalizationGain = ({
  buffer,
  targetDb = TARGET_DB,
  maxGain = MAX_GAIN,
}: CalculateNormalizationGainProps): number => {
  let sumOfSquares = 0;
  let totalSamples = 0;

  // Sum the squared amplitude of every sample across every channel.
  // Squaring removes sign so positive and negative swings contribute equally.
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      sumOfSquares += data[i] * data[i];
    }
    totalSamples += data.length;
  }

  // RMS (Root Mean Square) is the standard measure of perceived loudness.
  const rms = Math.sqrt(sumOfSquares / Math.max(totalSamples, 1));

  return rmsToGain(rms, targetDb, maxGain);
};

export const WAVEFORM_BAR_COUNT = 32;

type CalculateWaveformPeaksProps = {
  buffer: AudioBuffer;
};

// Splits the first channel into WAVEFORM_BAR_COUNT equal slices and returns the
// loudest sample of each slice, scaled so the loudest bar in the file is 1.
// Quiet recordings still get a visible shape because of the scaling.
export const calculateWaveformPeaks = ({
  buffer,
}: CalculateWaveformPeaksProps): number[] => {
  const data = buffer.getChannelData(0);
  const samplesPerBar = Math.max(
    1,
    Math.floor(data.length / WAVEFORM_BAR_COUNT)
  );
  const peaks: number[] = [];

  for (let bar = 0; bar < WAVEFORM_BAR_COUNT; bar++) {
    const sliceStart = bar * samplesPerBar;
    const sliceEnd = Math.min(sliceStart + samplesPerBar, data.length);
    let peak = 0;

    for (let i = sliceStart; i < sliceEnd; i++) {
      const amplitude = Math.abs(data[i]);
      if (amplitude > peak) {
        peak = amplitude;
      }
    }

    peaks.push(peak);
  }

  const loudestPeak = Math.max(...peaks, 1e-6);

  return peaks.map((peak) => peak / loudestPeak);
};
