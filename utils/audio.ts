// Define the shape of our audio processor object
type AudioProcessor = {
  readonly context: AudioContext; // Web Audio context for processing
  readonly gain: GainNode; // Node that controls volume
  readonly analyser: AnalyserNode; // Node that analyzes audio data
  setGain: (value: number) => void; // Manually set gain value
  getGain: () => number; // Get current gain value
  startAutoGain: () => void; // Start automatic gain adjustment
  stopAutoGain: () => void; // Stop automatic gain adjustment
};

// Configuration options for creating an audio processor
type CreateAudioProcessorProps = {
  audioElement: HTMLAudioElement; // The audio element to process
  initialGain?: number; // Starting gain value
  minGain?: number; // Minimum allowed gain
  maxGain?: number; // Maximum allowed gain
  targetLevel?: number; // Target loudness level in decibels (dB)
};

// Store processors in a WeakMap to prevent memory leaks and duplicate connections
const audioProcessors = new WeakMap<HTMLAudioElement, AudioProcessor>();

export const createAudioProcessor = ({
  audioElement,
  initialGain = 1,
  minGain = 1,
  maxGain = 75, // Maximum gain multiplier (75x amplification)
  targetLevel = -10, // Target level in dB (-10 is a good balance between loudness and avoiding distortion)
}: CreateAudioProcessorProps): AudioProcessor => {
  // Return existing processor if we've already set one up for this audio element
  const existing = audioProcessors.get(audioElement);
  if (existing) {
    existing.setGain(initialGain);
    return existing;
  }

  // Set up the Web Audio processing chain
  const context = new AudioContext();
  const source = context.createMediaElementSource(audioElement);
  const analyser = context.createAnalyser();
  const gain = context.createGain();

  // Configure the analyzer for audio level detection
  analyser.fftSize = 2048; // Size of FFT for analysis (larger = more precise but slower)
  analyser.smoothingTimeConstant = 0.7; // How smooth the analysis is (0 = no smoothing, 1 = maximum smoothing)

  // Connect the audio nodes in sequence: source -> analyser -> gain -> speakers
  source.connect(analyser);
  analyser.connect(gain);
  gain.connect(context.destination);

  // Track the animation frame for auto-gain updates
  let autoGainRAF: number | null = null;

  // Function that continuously updates the gain based on audio levels
  const updateGain = () => {
    // Get audio data from analyzer
    const dataArray = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) to get average audio level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);

    // Convert RMS to decibels (dB)
    // Use max to prevent -Infinity when signal is very quiet
    const db = 20 * Math.log10(Math.max(rms, 1e-6));

    // Calculate how much gain we need to reach target level
    const dbDiff = targetLevel - db;
    const newGain = Math.min(
      maxGain,
      Math.max(minGain, Math.pow(10, dbDiff / 20))
    );

    // Smooth gain changes to prevent sudden volume jumps
    // 85% previous value, 15% new value for smooth transitions
    gain.gain.value = gain.gain.value * 0.85 + newGain * 0.15;

    // Schedule next update
    autoGainRAF = requestAnimationFrame(updateGain);
  };

  // Create the processor interface
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

  // Store the processor and initialize gain
  audioProcessors.set(audioElement, processor);
  processor.setGain(initialGain);

  return processor;
};
