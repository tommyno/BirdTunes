type AudioProcessor = {
  readonly context: AudioContext;
  readonly gain: GainNode;
  readonly analyser: AnalyserNode;
  setGain: (value: number) => void;
  startDynamicGain: () => void;
  stopDynamicGain: () => void;
};

type CreateAudioProcessorProps = {
  audioElement: HTMLAudioElement;
  initialGain?: number;
};

const audioProcessors = new WeakMap<HTMLAudioElement, AudioProcessor>();

export const createAudioProcessor = ({
  audioElement,
  initialGain = 1,
}: CreateAudioProcessorProps): AudioProcessor => {
  const existing = audioProcessors.get(audioElement);
  if (existing) {
    existing.setGain(initialGain);
    return existing;
  }

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

  const updateDynamicGain = () => {
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const db = 20 * Math.log10(Math.max(rms, 1e-6));
    const dbDiff = -10 - db;
    const targetGain = Math.min(75, Math.max(1, Math.pow(10, dbDiff / 20)));

    // Asymmetric attack/release: slow to increase (2%), fast to decrease (25%).
    // This prevents gain from shooting up during leading silence and causing a pop
    // when the bird call suddenly arrives.
    const isIncreasing = targetGain > gain.gain.value;
    const alpha = isIncreasing ? 0.02 : 0.25;
    gain.gain.value = gain.gain.value * (1 - alpha) + targetGain * alpha;

    dynamicGainRAF = requestAnimationFrame(updateDynamicGain);
  };

  const processor: AudioProcessor = {
    context,
    gain,
    analyser,
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

  audioProcessors.set(audioElement, processor);
  processor.setGain(initialGain);

  return processor;
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
  targetDb = -10,
  maxGain = 75,
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

  // Convert RMS to decibels. The factor 20 is the standard scalar for
  // amplitude ratios (as opposed to 10 used for power ratios), because
  // dB = 10 * log10(power) and power ∝ amplitude², so 10 * 2 = 20.
  // We floor at 1e-6 to avoid log10(0) = -Infinity on silent recordings.
  const db = 20 * Math.log10(Math.max(rms, 1e-6));

  // How many dB we need to add to reach the target level.
  const dbDiff = targetDb - db;

  // Convert that dB difference back to a linear multiplier.
  // Inverse of the formula above: gain = 10^(dB / 20).
  const gain = Math.pow(10, dbDiff / 20);

  // Clamp: never reduce below 1× (don't attenuate already-loud recordings)
  // and never exceed maxGain× (protects against near-silent recordings).
  return Math.min(maxGain, Math.max(1, gain));
};
