type AudioProcessor = {
  readonly context: AudioContext;
  readonly gain: GainNode;
  readonly analyser: AnalyserNode;
  setGain: (value: number) => void;
  getGain: () => number;
  startAutoGain: () => void;
  stopAutoGain: () => void;
};

type CreateAudioProcessorProps = {
  audioElement: HTMLAudioElement;
  initialGain?: number;
  minGain?: number;
  maxGain?: number;
  targetLevel?: number; // Target dB level we want to achieve
};

// Track connected audio elements to prevent duplicate connections
const audioProcessors = new WeakMap<HTMLAudioElement, AudioProcessor>();

export const createAudioProcessor = ({
  audioElement,
  initialGain = 1,
  minGain = 1,
  maxGain = 50, // Maximum gain multiplier
  targetLevel = -10, // Target level in dB
}: CreateAudioProcessorProps): AudioProcessor => {
  // Return existing processor if already connected
  const existing = audioProcessors.get(audioElement);
  if (existing) {
    existing.setGain(initialGain);
    return existing;
  }

  // Create new audio processing chain
  const context = new AudioContext();
  const source = context.createMediaElementSource(audioElement);
  const analyser = context.createAnalyser();
  const gain = context.createGain();

  // Configure analyser
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;

  // Connect the audio graph: source -> analyser -> gain -> destination
  source.connect(analyser);
  analyser.connect(gain);
  gain.connect(context.destination);

  let autoGainRAF: number | null = null;

  const updateGain = () => {
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) value
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convert to dB
    const db = 20 * Math.log10(rms);

    // Calculate required gain to reach target level
    const dbDiff = targetLevel - db;
    const newGain = Math.min(
      maxGain,
      Math.max(minGain, Math.pow(10, dbDiff / 20))
    );

    // Smooth gain changes
    gain.gain.value = gain.gain.value * 0.95 + newGain * 0.05;

    autoGainRAF = requestAnimationFrame(updateGain);
  };

  const processor: AudioProcessor = {
    context,
    gain,
    analyser,
    setGain: (value) => {
      gain.gain.value = value;
    },
    getGain: () => gain.gain.value,
    startAutoGain: () => {
      if (!autoGainRAF) {
        updateGain();
      }
    },
    stopAutoGain: () => {
      if (autoGainRAF) {
        cancelAnimationFrame(autoGainRAF);
        autoGainRAF = null;
      }
    },
  };

  // Store the processor and set initial gain
  audioProcessors.set(audioElement, processor);
  processor.setGain(initialGain);

  return processor;
};
