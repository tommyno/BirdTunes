type AudioProcessor = {
  readonly context: AudioContext;
  readonly gain: GainNode;
  setGain: (value: number) => void;
  getGain: () => number;
};

type CreateAudioProcessorProps = {
  audioElement: HTMLAudioElement;
  initialGain?: number;
};

// Track connected audio elements to prevent duplicate connections
const audioProcessors = new WeakMap<HTMLAudioElement, AudioProcessor>();

export const createAudioProcessor = ({
  audioElement,
  initialGain = 1,
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
  const gain = context.createGain();

  // Connect the audio graph
  source.connect(gain);
  gain.connect(context.destination);

  const processor: AudioProcessor = {
    context,
    gain,
    setGain: (value) => {
      gain.gain.value = value;
    },
    getGain: () => gain.gain.value,
  };

  // Store the processor and set initial gain
  audioProcessors.set(audioElement, processor);
  processor.setGain(initialGain);

  return processor;
};
