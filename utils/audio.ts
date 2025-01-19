type AudioProcessor = {
  context: AudioContext;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
  media: HTMLAudioElement;
  amplify: (multiplier: number) => void;
  getAmpLevel: () => number;
};

// Keep track of audio elements that have been connected
const connectedElements = new WeakMap<HTMLAudioElement, AudioProcessor>();

export function amplifyMedia(
  mediaElem: HTMLAudioElement,
  multiplier: number
): AudioProcessor {
  // Check if this audio element is already connected
  const existing = connectedElements.get(mediaElem);
  if (existing) {
    existing.amplify(multiplier);
    return existing;
  }

  // Create new audio processing chain
  const context = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const result: AudioProcessor = {
    context,
    source: context.createMediaElementSource(mediaElem),
    gain: context.createGain(),
    media: mediaElem,
    amplify: function (multiplier: number) {
      this.gain.gain.value = multiplier;
    },
    getAmpLevel: function () {
      return this.gain.gain.value;
    },
  };

  // Connect the audio graph
  result.source.connect(result.gain);
  result.gain.connect(context.destination);
  result.amplify(multiplier);

  // Store the connection
  connectedElements.set(mediaElem, result);

  return result;
}
