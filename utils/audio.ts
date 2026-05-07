type AudioProcessor = {
  readonly context: AudioContext;
  readonly gain: GainNode;
  setGain: (value: number) => void;
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
  const gain = context.createGain();

  source.connect(gain);
  gain.connect(context.destination);

  const processor: AudioProcessor = {
    context,
    gain,
    setGain: (value) => {
      gain.gain.value = value;
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
