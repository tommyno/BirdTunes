// What we know about a clip once it has been loaded. peaks is null when the
// file couldn't be decoded (e.g. iOS PWA + FLAC), so no waveform can be drawn.
export type ClipInfo = {
  duration: number;
  peaks: number[] | null;
};
